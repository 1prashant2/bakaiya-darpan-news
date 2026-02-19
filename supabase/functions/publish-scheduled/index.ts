import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Find articles that are scheduled and past their scheduled time
    const { data: articles, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, scheduled_at")
      .eq("is_published", false)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled articles:", fetchError);
      throw fetchError;
    }

    if (!articles || articles.length === 0) {
      console.log("No scheduled articles to publish");
      return new Response(JSON.stringify({ published: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Publish each scheduled article
    const ids = articles.map((a) => a.id);
    const { error: updateError } = await supabase
      .from("articles")
      .update({ is_published: true, scheduled_at: null, updated_at: now })
      .in("id", ids);

    if (updateError) {
      console.error("Error publishing scheduled articles:", updateError);
      throw updateError;
    }

    console.log(`Published ${articles.length} scheduled articles:`, articles.map(a => a.title));

    return new Response(
      JSON.stringify({ published: articles.length, articles: articles.map(a => a.title) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("publish-scheduled error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
