import type { CustomBackgroundRecord } from "@/lib/backgrounds/custom-background-schema";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/backgrounds/custom/[id]
 * Get a single custom background with full specification
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("custom_backgrounds")
      .select("id, user_id, name, created_at, environment_spec, prompt_snippet")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return Response.json({ error: "Background not found" }, { status: 404 });
      }
      console.error("[custom background GET] Error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ background: data as CustomBackgroundRecord });
  } catch (error) {
    console.error("[custom background GET] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to get background" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/backgrounds/custom/[id]
 * Delete a custom background
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("custom_backgrounds")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[custom background DELETE] Error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[custom background DELETE] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete background" },
      { status: 500 }
    );
  }
}
