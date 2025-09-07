import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dish = formData.get("dish");
    const background = formData.get("background");
    const prompt = String(formData.get("prompt") || "");
    const lensLook = String(formData.get("lensLook") || "");

    if (!(dish instanceof File)) {
      return NextResponse.json({ error: "Missing dish file" }, { status: 400 });
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing AI_GATEWAY_API_KEY" }, { status: 500 });
    }

    const dishArrayBuffer = await dish.arrayBuffer();
    const dishBase64 = Buffer.from(dishArrayBuffer).toString("base64");
    const dishMediaType = dish.type || "image/jpeg";
    const dishDataUrl = `data:${dishMediaType};base64,${dishBase64}`;

    const dishSizeKB = Math.round(dishArrayBuffer.byteLength / 1024);
    console.log("[generate] dish file:", { type: dishMediaType, sizeKB: dishSizeKB });

    let backgroundDataUrl = null;
    let bgSizeKB: number | undefined;
    if (background instanceof File) {
      const bgArrayBuffer = await background.arrayBuffer();
      const bgBase64 = Buffer.from(bgArrayBuffer).toString("base64");
      const bgMediaType = background.type || "image/jpeg";
      backgroundDataUrl = `data:${bgMediaType};base64,${bgBase64}`;
      bgSizeKB = Math.round(bgArrayBuffer.byteLength / 1024);
      console.log("[generate] background file:", { type: bgMediaType, sizeKB: bgSizeKB });
    }

    // --- PASO 1: ANALIZAR LA IMAGEN DEL PLATO ---
    const dishAnalysisPrompt = "Describe detalladamente el plato principal en esta imagen. Incluye el tipo de comida, ingredientes visibles, colores principales, texturas (ej. crujiente, cremoso, tierno), y su estado general (fresco, cocido, etc.). Responde solo con la descripción, sin introducciones.";

    console.time("[generate] dish analysis");
    const dishAnalysisResp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        stream: false,
        modalities: ["text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: dishAnalysisPrompt },
              { type: "image_url", image_url: { url: dishDataUrl } },
            ],
          },
        ],
      }),
    });
    console.timeEnd("[generate] dish analysis");
    console.log("[generate] dish analysis status:", dishAnalysisResp.status, dishAnalysisResp.statusText);

    if (!dishAnalysisResp.ok) {
        const errText = await dishAnalysisResp.text();
        console.error("[generate] dish analysis error:", errText);
        return NextResponse.json({ error: `Gateway error during dish analysis: ${dishAnalysisResp.status} ${errText}` }, { status: 502 });
    }
    const dishAnalysisJson = (await dishAnalysisResp.json()) as any;
    {
      const dishMsg = dishAnalysisJson.choices?.[0]?.message;
      const dishContent = dishMsg?.content as unknown;
      var dishDescription =
        typeof dishContent === "string"
          ? dishContent
          : (dishMsg?.content?.[0]?.text as string | undefined);
    }

    if (!dishDescription) {
        console.error("[generate] missing dish description");
        return NextResponse.json({ error: "Could not analyze the dish." }, { status: 502 });
    }

    // --- PASO 2: ANALIZAR EL FONDO (SI SE PROPORCIONA) ---
    let backgroundDescription = "un fondo predeterminado (por ejemplo, una mesa de madera oscura con un fondo de restaurante desenfocado)";
    if (backgroundDataUrl) {
        const bgAnalysisPrompt = "Describe el ambiente, el estilo y los colores principales de este fondo. ¿Qué tipo de escena representa? Responde solo con la descripción, sin introducciones.";
        console.time("[generate] background analysis");
        const bgAnalysisResp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-image-preview",
                stream: false,
                modalities: ["text"],
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: bgAnalysisPrompt },
                            { type: "image_url", image_url: { url: backgroundDataUrl } },
                        ],
                    },
                ],
            }),
        });
        console.timeEnd("[generate] background analysis");
        console.log("[generate] background analysis status:", bgAnalysisResp.status, bgAnalysisResp.statusText);

        if (bgAnalysisResp.ok) {
            const bgAnalysisJson = (await bgAnalysisResp.json()) as any;
            {
              const bgMsg = bgAnalysisJson.choices?.[0]?.message;
              const bgContent = bgMsg?.content as unknown;
              const parsed =
                typeof bgContent === "string"
                  ? bgContent
                  : (bgMsg?.content?.[0]?.text as string | undefined);
              backgroundDescription = parsed || backgroundDescription;
            }
        } else {
            const errText = await bgAnalysisResp.text();
            console.error("[generate] background analysis error:", errText);
            return NextResponse.json({ error: `Gateway error during background analysis: ${bgAnalysisResp.status} ${errText}` }, { status: 502 });
        }
    }

    // --- PASO 3: GENERAR EL PROMPT FINAL DE ALTA CALIDAD ---
    const finalSystemPrompt = `
      Basado en la siguiente descripción del plato: '${dishDescription}'
      Y la siguiente descripción del fondo: '${backgroundDescription}'

      Crea un prompt detallado para generar una imagen de alta calidad. El objetivo es una fotografía de alimentos profesional que **mantenga la identidad del plato original, sin cambiar los ingredientes, la disposición o el tipo de comida**.

      Asegúrate de que la descripción sea fotorrealista y apta para la generación de una imagen.

      Características para la generación de la imagen:
      - **Iluminación:** Suave, atractiva y direccional, que realce las texturas y colores del plato.
      - **Nitidez:** Enfoque nítido en el plato, con los elementos principales bien definidos.
      - **Colores:** Naturales, vibrantes y saturados.
      - **Composición:** Estética y equilibrada, haciendo que el plato sea el punto focal.
      - **Fondo:** Ligeramente desenfocado (efecto bokeh sutil) para un toque artístico, pero que mantenga la atmósfera descrita.
      - **Atmósfera:** Que la imagen sea apetitosa e invitante.
      - **Estilo de lente:** ${lensLook}.
      
      ${prompt ? `Sugerencia de estilo adicional del usuario: "${prompt}".` : ''}

      Comienza el prompt con 'Fotografía de alta calidad de...' y sé muy descriptivo en un solo párrafo.
    `;

    console.log("[generate] final prompt seed (trunc):", finalSystemPrompt.slice(0, 160));
    console.time("[generate] prompt generation");
    const finalPromptGenResp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // texto
        stream: false,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: finalSystemPrompt }],
          },
        ],
      }),
    });
    console.timeEnd("[generate] prompt generation");
    console.log("[generate] prompt generation status:", finalPromptGenResp.status, finalPromptGenResp.statusText);

    if (!finalPromptGenResp.ok) {
        const errText = await finalPromptGenResp.text();
        console.error("[generate] prompt generation error:", errText);
        return NextResponse.json({ error: `Gateway error during prompt generation: ${finalPromptGenResp.status} ${errText}` }, { status: 502 });
    }
    const finalPromptGenJson = (await finalPromptGenResp.json()) as any;
    {
      const finalMsg = finalPromptGenJson.choices?.[0]?.message;
      const finalContent = finalMsg?.content as unknown;
      var finalPrompt =
        typeof finalContent === "string"
          ? finalContent
          : (finalMsg?.content?.[0]?.text as string | undefined);
    }

    if (!finalPrompt) {
        console.error("[generate] missing final prompt");
        return NextResponse.json({ error: "Could not generate the final prompt." }, { status: 502 });
    }

    console.log("[generate] final prompt (trunc):", finalPrompt.slice(0, 160));

    // --- PASO 4: GENERAR LA IMAGEN FINAL DE ALTA CALIDAD ---
    console.time("[generate] image generation");
    const resp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        stream: false,
        modalities: ["text", "image"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
            ],
          },
        ],
      }),
    });
    console.timeEnd("[generate] image generation");
    console.log("[generate] image generation status:", resp.status, resp.statusText);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[generate] image generation error:", errText);
      return NextResponse.json({ error: `Gateway error: ${resp.status} ${errText}` }, { status: 502 });
    }
    const json = (await resp.json()) as unknown;

    const images =
      typeof json === "object" && json !== null &&
      "choices" in json && Array.isArray((json as any).choices) &&
      (json as any).choices[0]?.message?.images;

    const imageUrl = Array.isArray(images)
      ? images[0]?.image_url?.url
      : undefined;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("data:image/")) {
      console.error("[generate] no image produced", { hasImages: Array.isArray(images), imageUrlType: typeof imageUrl });
      return NextResponse.json({ error: "No image produced" }, { status: 502 });
    }

    const commaIdx = imageUrl.indexOf(",");
    const header = imageUrl.substring(5, commaIdx);
    const outType = header.split(";")[0];
    const b64 = imageUrl.substring(commaIdx + 1);
    const outBuffer = Buffer.from(b64, "base64");
    const outName = outType.includes("jpeg") ? "enhanced.jpg" : outType.includes("png") ? "enhanced.png" : "enhanced.webp";

    console.log("[generate] success:", { outType, outBytes: outBuffer.byteLength });

    return new Response(outBuffer, {
      status: 200,
      headers: {
        "Content-Type": outType,
        "Content-Disposition": `attachment; filename=\"${outName}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate] fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}