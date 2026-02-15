import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const { conversation_id } = await req.json();
    if (!conversation_id) throw new Error("Missing conversation_id");

    // Find available chatter: online, not at max capacity, lowest workload
    const { data: chatters } = await supabaseAdmin
      .from("chatters")
      .select("*")
      .eq("status", "online")
      .order("active_conversations", { ascending: true });

    const available = (chatters || []).filter(c => c.active_conversations < c.max_capacity);

    if (available.length === 0) {
      // Add to waiting queue
      const { data: conv } = await supabaseAdmin
        .from("conversations")
        .select("model_id, user_id")
        .eq("id", conversation_id)
        .single();

      if (conv) {
        await supabaseAdmin.from("waiting_queue").insert({
          user_id: conv.user_id,
          model_id: conv.model_id,
          status: "waiting",
        });
      }

      return new Response(JSON.stringify({ assigned: false, queued: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const chatter = available[0];

    // Assign chatter to conversation
    await supabaseAdmin
      .from("conversations")
      .update({ assigned_chatter_id: chatter.user_id })
      .eq("id", conversation_id);

    // Increment workload
    await supabaseAdmin
      .from("chatters")
      .update({ active_conversations: chatter.active_conversations + 1 })
      .eq("id", chatter.id);

    console.log(`[ASSIGN-CHATTER] Assigned chatter ${chatter.user_id} to conversation ${conversation_id}`);

    return new Response(JSON.stringify({ assigned: true, chatter_id: chatter.user_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ASSIGN-CHATTER] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
