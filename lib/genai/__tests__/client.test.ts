/**
 * GenAI Client Tests
 *
 * Tests for the modular Google GenAI client.
 * Run with: bun test lib/genai/__tests__/client.test.ts
 */

// Import the modules we're testing
import {
    ASPECT_RATIO_DIMENSIONS,
    createGenAIClient,
    normalizeAspectRatio,
} from "../index";

/**
 * Simple test runner for environments without bun:test
 * This allows the tests to run with `bun run` or `npx tsx`
 */
class TestRunner {
  private passed = 0;
  private failed = 0;

  async expect<T>(actual: T) {
    return {
      toBe: (expected: T) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected} but got ${actual}`);
        }
      },
      toBeGreaterThan: (n: number) => {
        if (typeof actual !== "number" || actual <= n) {
          throw new Error(`Expected ${actual} to be greater than ${n}`);
        }
      },
      toBeLessThan: (n: number) => {
        if (typeof actual !== "number" || actual >= n) {
          throw new Error(`Expected ${actual} to be less than ${n}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error(`Expected value to be defined`);
        }
      },
      toThrow: (message?: string) => {
        if (typeof actual !== "function") {
          throw new Error(`Expected a function`);
        }
        try {
          (actual as () => void)();
          throw new Error(`Expected function to throw`);
        } catch (e) {
          if (message && e instanceof Error && !e.message.includes(message)) {
            throw new Error(`Expected error message to include "${message}"`);
          }
        }
      },
    };
  }

  async it(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      this.passed++;
      console.log(`  ✅ ${name}`);
    } catch (e) {
      this.failed++;
      console.log(`  ❌ ${name}`);
      console.log(`     ${e instanceof Error ? e.message : e}`);
    }
  }

  async describe(name: string, fn: () => Promise<void> | void) {
    console.log(`\n${name}`);
    await fn();
  }

  summary() {
    console.log(`\n📊 ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

async function runTests() {
  const runner = new TestRunner();

  await runner.describe("GenAI Client", async () => {
    await runner.describe("  createGenAIClient", async () => {
      await runner.it("throws when GEMINI_API_KEY is missing", async () => {
        const originalKey = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        try {
          (await runner.expect(() => createGenAIClient())).toThrow("Missing GEMINI_API_KEY");
        } finally {
          if (originalKey) process.env.GEMINI_API_KEY = originalKey;
        }
      });

      await runner.it("creates client when API key is provided via config", async () => {
        const client = createGenAIClient({ apiKey: "test-key" });
        (await runner.expect(client)).toBeDefined();
      });
    });

    await runner.describe("  normalizeAspectRatio", async () => {
      await runner.it("handles standard formats", async () => {
        (await runner.expect(normalizeAspectRatio("1:1"))).toBe("1:1");
        (await runner.expect(normalizeAspectRatio("4:5"))).toBe("4:5");
        (await runner.expect(normalizeAspectRatio("16:9"))).toBe("16:9");
        (await runner.expect(normalizeAspectRatio("9:16"))).toBe("9:16");
      });

      await runner.it("handles alternative formats", async () => {
        (await runner.expect(normalizeAspectRatio("1x1"))).toBe("1:1");
        (await runner.expect(normalizeAspectRatio("4x5"))).toBe("4:5");
        (await runner.expect(normalizeAspectRatio("16x9"))).toBe("16:9");
      });

      await runner.it("handles 'square' keyword", async () => {
        (await runner.expect(normalizeAspectRatio("square"))).toBe("1:1");
      });

      await runner.it("defaults to 1:1 for unknown values", async () => {
        (await runner.expect(normalizeAspectRatio("unknown"))).toBe("1:1");
        (await runner.expect(normalizeAspectRatio(""))).toBe("1:1");
      });
    });

    await runner.describe("  ASPECT_RATIO_DIMENSIONS", async () => {
      await runner.it("has all supported aspect ratios", async () => {
        const expectedRatios = [
          "1:1", "4:5", "5:4", "3:4", "4:3",
          "2:3", "3:2", "9:16", "16:9", "21:9"
        ];

        for (const ratio of expectedRatios) {
          (await runner.expect(ASPECT_RATIO_DIMENSIONS[ratio as keyof typeof ASPECT_RATIO_DIMENSIONS])).toBeDefined();
        }
      });

      await runner.it("has valid dimensions for each ratio", async () => {
        for (const [ratio, dims] of Object.entries(ASPECT_RATIO_DIMENSIONS)) {
          (await runner.expect(dims.width)).toBeGreaterThan(0);
          (await runner.expect(dims.height)).toBeGreaterThan(0);

          const [w, h] = ratio.split(":").map(Number);
          const expected = w / h;
          const actual = dims.width / dims.height;
          (await runner.expect(Math.abs(actual - expected))).toBeLessThan(0.1);
        }
      });
    });
  });

  const success = runner.summary();
  process.exit(success ? 0 : 1);
}

runTests();
