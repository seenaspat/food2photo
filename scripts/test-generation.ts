#!/usr/bin/env bun
/**
 * Generation API Test Script
 *
 * Tests the generation flow by calling the API endpoints.
 * Run with: bun scripts/test-generation.ts
 *
 * Prerequisites:
 * - GEMINI_API_KEY must be set
 * - Server must be running at localhost:3000 (or specify URL)
 * - You need a valid auth session (copy cookies from browser)
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "3:2"] as const;

interface TestResult {
  aspectRatio: string;
  success: boolean;
  duration: number;
  outputFile?: string;
  error?: string;
}

async function loadTestImage(): Promise<Buffer> {
  // Try to find a test image in the output directory or use a placeholder
  const testImagePath = path.join(process.cwd(), "outputs", "test-dish.jpg");

  try {
    return await readFile(testImagePath);
  } catch {
    console.log("⚠️  No test image found at outputs/test-dish.jpg");
    console.log("   Please add a dish image for testing.");
    process.exit(1);
  }
}

async function testGeneration(
  imageBuffer: Buffer,
  aspectRatio: string,
  cookies?: string
): Promise<TestResult> {
  const start = Date.now();

  try {
    const formData = new FormData();
    formData.append("dish", new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" }), "test-dish.jpg");
    formData.append("aspectRatio", aspectRatio);
    formData.append("lensLook", "50mm");

    const headers: Record<string, string> = {};
    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers,
      body: formData,
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        aspectRatio,
        success: false,
        duration,
        error: `HTTP ${response.status}: ${errorText.slice(0, 200)}`,
      };
    }

    // Check if we got an image back
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.startsWith("image/")) {
      const text = await response.text();
      return {
        aspectRatio,
        success: false,
        duration,
        error: `Unexpected content type: ${contentType}. Body: ${text.slice(0, 200)}`,
      };
    }

    // Save the output image
    const arrayBuffer = await response.arrayBuffer();
    const ext = contentType.includes("jpeg") ? "jpg" : contentType.includes("png") ? "png" : "webp";
    const outputFile = path.join(process.cwd(), "outputs", `test-${aspectRatio.replace(":", "x")}.${ext}`);
    await writeFile(outputFile, Buffer.from(arrayBuffer));

    return {
      aspectRatio,
      success: true,
      duration,
      outputFile,
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      aspectRatio,
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("🧪 Generation API Test Script");
  console.log("==============================\n");

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set");
    process.exit(1);
  }
  console.log("✅ GEMINI_API_KEY is set\n");

  // Load test image
  console.log("📷 Loading test image...");
  const imageBuffer = await loadTestImage();
  console.log(`   Loaded ${(imageBuffer.length / 1024).toFixed(1)} KB\n`);

  // Check for auth cookies (optional)
  const cookies = process.env.AUTH_COOKIES;
  if (!cookies) {
    console.log("⚠️  No AUTH_COOKIES set - API calls may fail with 401");
    console.log("   Set AUTH_COOKIES env var with your session cookies\n");
  }

  // Run tests
  console.log("🚀 Running generation tests...\n");
  const results: TestResult[] = [];

  for (const ar of ASPECT_RATIOS) {
    console.log(`  Testing ${ar}...`);
    const result = await testGeneration(imageBuffer, ar, cookies);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ ${ar}: ${result.duration}ms → ${result.outputFile}`);
    } else {
      console.log(`  ❌ ${ar}: ${result.duration}ms - ${result.error}`);
    }
  }

  // Summary
  console.log("\n==============================");
  console.log("📊 Summary");
  console.log("==============================");

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`  Passed: ${successful}/${results.length}`);
  console.log(`  Failed: ${failed}/${results.length}`);
  console.log(`  Avg Duration: ${(avgDuration / 1000).toFixed(1)}s`);

  if (failed > 0) {
    console.log("\n❌ Some tests failed. Check the output above for details.");
    process.exit(1);
  }

  console.log("\n✅ All tests passed!");
}

main().catch(console.error);
