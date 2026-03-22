import { compilePromptSnippet } from "@/lib/backgrounds/compile-prompt-snippet";
import type { CustomBackgroundLite, CustomEnvironmentSpec } from "@/lib/backgrounds/custom-background-schema";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/backgrounds/custom
 * List user's custom backgrounds (lite version without full spec)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("custom_backgrounds")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[custom backgrounds GET] Error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const backgrounds: CustomBackgroundLite[] = data ?? [];
    return Response.json({ backgrounds });
  } catch (error) {
    console.error("[custom backgrounds GET] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to list backgrounds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backgrounds/custom
 * Create a new custom background from an analyzed specification
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, environment_spec } = body as {
      name?: string;
      environment_spec?: CustomEnvironmentSpec;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    if (!environment_spec || typeof environment_spec !== "object") {
      return Response.json({ error: "Environment specification is required" }, { status: 400 });
    }

    // Compile the prompt snippet from the spec
    const prompt_snippet = compilePromptSnippet(environment_spec);

    const { data, error } = await supabase
      .from("custom_backgrounds")
      .insert({
        user_id: user.id,
        name: name.trim(),
        environment_spec,
        prompt_snippet,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      console.error("[custom backgrounds POST] Error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ background: data });
  } catch (error) {
    console.error("[custom backgrounds POST] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create background" },
      { status: 500 }
    );
  }
}
