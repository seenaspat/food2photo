import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set. Export it first.");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Simple CLI parsing to support optional flags while keeping backward compatibility:
  // Usage examples:
  //   bun run gen:img "your prompt here"
  //   bun run gen:img --outdir outputs/backgrounds --prefix background "your prompt here"
  // Also supports env var OUT_DIR as a default for --outdir
  const argv = process.argv.slice(2);
  let outDir = process.env.OUT_DIR || "outputs";
  let filePrefix = "gemini-native-image";

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--outdir" || token === "-o") {
      const nextVal = argv[i + 1];
      if (nextVal && !nextVal.startsWith("-")) {
        outDir = nextVal;
        argv.splice(i, 2);
        i--;
        continue;
      }
    }
    const outMatch = token.match(/^--outdir=(.+)$/);
    if (outMatch) {
      outDir = outMatch[1];
      argv.splice(i, 1);
      i--;
      continue;
    }

    if (token === "--prefix" || token === "-p") {
      const nextVal = argv[i + 1];
      if (nextVal && !nextVal.startsWith("-")) {
        filePrefix = nextVal;
        argv.splice(i, 2);
        i--;
        continue;
      }
    }
    const preMatch = token.match(/^--prefix=(.+)$/);
    if (preMatch) {
      filePrefix = preMatch[1];
      argv.splice(i, 1);
      i--;
      continue;
    }
  }

  const prompt = argv.join(" ") ||
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    let wrote = false;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");

        // Decide extension based on mimeType when available (fallback to png)
        const mime = part.inlineData.mimeType || "image/png";
        const ext = mime.includes("jpeg") || mime.includes("jpg")
          ? "jpg"
          : mime.includes("webp")
            ? "webp"
            : "png";

        // Ensure output directory exists
        const resolvedOutDir = path.resolve(outDir);
        fs.mkdirSync(resolvedOutDir, { recursive: true });

        // Create a readable, unique filename based on prefix, prompt snippet, and timestamp
        const sanitizedSnippet = prompt
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\- ]/g, "")
          .split(" ")
          .filter(Boolean)
          .slice(0, 8)
          .join("-");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const rand = Math.random().toString(36).slice(2, 8);
        const fileName = `${filePrefix}-${sanitizedSnippet || "image"}-${timestamp}-${rand}.${ext}`;
        const outPath = path.join(resolvedOutDir, fileName);

        fs.writeFileSync(outPath, buffer);
        console.log(`Image saved as ${outPath}`);
        wrote = true;
      }
    }

    if (!wrote) {
      console.error("No inline image data found in response.");
      console.error(JSON.stringify(response, null, 2));
      process.exit(2);
    }
  } catch (err) {
    console.error("Generation failed:", err?.response?.data ?? err);
    process.exit(3);
  }
}

main();
