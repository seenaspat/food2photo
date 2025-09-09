import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    template: path.resolve("templates/backgrounds-v2.md"),
    varsPath: "",
    outDir: process.env.OUT_DIR || path.resolve("outputs/backgrounds"),
    prefix: "bg",
    print: false,
    overrides: {},
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const nextVal = argv[i + 1];

    const take = (setter) => {
      if (nextVal && !nextVal.startsWith("-")) {
        setter(nextVal);
        argv.splice(i, 2);
        i--;
      } else {
        throw new Error(`Missing value for ${token}`);
      }
    };

    if (token === "--template" || token === "-t") { take((v) => (args.template = path.resolve(v))); continue; }
    if (token.startsWith("--template=")) { args.template = path.resolve(token.split("=")[1]); argv.splice(i,1); i--; continue; }

    if (token === "--vars" || token === "-v") { take((v) => (args.varsPath = path.resolve(v))); continue; }
    if (token.startsWith("--vars=")) { args.varsPath = path.resolve(token.split("=")[1]); argv.splice(i,1); i--; continue; }

    if (token === "--outdir" || token === "-o") { take((v) => (args.outDir = path.resolve(v))); continue; }
    if (token.startsWith("--outdir=")) { args.outDir = path.resolve(token.split("=")[1]); argv.splice(i,1); i--; continue; }

    if (token === "--prefix" || token === "-p") { take((v) => (args.prefix = v)); continue; }
    if (token.startsWith("--prefix=")) { args.prefix = token.split("=")[1]; argv.splice(i,1); i--; continue; }

    if (token === "--print" || token === "--dry" || token === "--dry-run") { args.print = true; argv.splice(i,1); i--; continue; }

    if (token === "--set" || token === "-s") {
      const kv = nextVal;
      if (!kv || kv.startsWith("-")) throw new Error("--set requires KEY=VALUE");
      const eq = kv.indexOf("=");
      if (eq === -1) throw new Error("--set requires KEY=VALUE");
      const k = kv.slice(0, eq);
      const v = kv.slice(eq + 1);
      args.overrides[k] = v;
      argv.splice(i, 2);
      i--;
      continue;
    }

    if (token.startsWith("--set=")) {
      const kv = token.slice(6);
      const eq = kv.indexOf("=");
      if (eq === -1) throw new Error("--set requires KEY=VALUE");
      const k = kv.slice(0, eq);
      const v = kv.slice(eq + 1);
      args.overrides[k] = v;
      argv.splice(i,1);
      i--;
      continue;
    }
  }
  return args;
}

function extractTemplateBlock(md) {
  const match = md.match(/```([\s\S]*?)```/);
  if (!match) throw new Error("No code block found in template file");
  return match[1];
}

function renderTemplate(block, vars) {
  return block.replace(/\{([A-Z0-9_]+)\}/g, (m, key) => {
    const val = vars[key];
    return val === undefined || val === null ? m : String(val);
  });
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set. Export it first.");
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  if (!args.varsPath) {
    console.error("Please provide --vars path/to/vars.json (or use --set KEY=VALUE).");
    process.exit(1);
  }

  const templateMd = fs.readFileSync(args.template, "utf8");
  const block = extractTemplateBlock(templateMd);

  let vars = {};
  try {
    vars = JSON.parse(fs.readFileSync(args.varsPath, "utf8"));
  } catch (e) {
    console.error("Failed to read or parse vars JSON:", e.message);
    process.exit(1);
  }
  Object.assign(vars, args.overrides);

  const prompt = renderTemplate(block, vars);

  if (args.print) {
    console.log(prompt);
    process.exit(0);
  }

  const ai = new GoogleGenAI({ apiKey });
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
        const mime = part.inlineData.mimeType || "image/png";
        const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("webp") ? "webp" : "png";

        fs.mkdirSync(args.outDir, { recursive: true });

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
        const fileName = `${args.prefix}-${sanitizedSnippet || "image"}-${timestamp}-${rand}.${ext}`;
        const outPath = path.join(args.outDir, fileName);
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


