import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VARS_DIR = path.resolve("templates/varsv4");
const TEMPLATE = path.resolve("templates/backgrounds-v4.md");
const OUT_DIR = path.resolve("outputs/backgrounds");

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => path.join(dir, f));
}

async function runOne(varsPath) {
  return new Promise((resolve, reject) => {
    const base = path.basename(varsPath, ".json");
    const prefix = `bg-v4-${base}`;
    const args = [
      "scripts/generate-background-from-template.js",
      "--template",
      TEMPLATE,
      "--vars",
      varsPath,
      "--outdir",
      OUT_DIR,
      "--prefix",
      prefix,
    ];
    const child = spawn("bun", args, { cwd: ROOT, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${base} failed with code ${code}`));
    });
  });
}

async function main() {
  fs.mkdirSync(VARS_DIR, { recursive: true });
  const files = listJsonFiles(VARS_DIR);
  if (files.length === 0) {
    console.error(`No JSON files found in ${VARS_DIR}`);
    process.exit(1);
  }
  console.log(`Generating ${files.length} v4 overhead backgrounds to ${OUT_DIR}...`);
  for (const file of files) {
    console.log(`\n--- Generating (v4) for ${path.basename(file)} ---`);
    // eslint-disable-next-line no-await-in-loop
    await runOne(file);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


