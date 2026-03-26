import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Defined action costs
const ACTION_COSTS: Record<string, number> = {
  chat: 1,
  image_gen: 2,
  // content_unlock costs are variable and passed in the request
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const userId = userData.user.id;
    const { action, content_id, cost: customCost } = await req.json();

    if (!action) throw new Error("action is required");

    // Determine cost
    let cost: number;
    if (action === "content_unlock" && typeof customCost === "number") {
      cost = customCost;
    } else if (ACTION_COSTS[action] !== undefined) {
      cost = ACTION_COSTS[action];
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    if (cost <= 0) {
      return new Response(JSON.stringify({ success: true, deducted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current balance
    const { data: wallet, error: walletError } = await serviceClient
      .from("gem_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) throw new Error("Wallet not found");

    if (wallet.balance < cost) {
      return new Response(JSON.stringify({
        error: `Not enough diamonds. You need ${cost} but have ${wallet.balance}.`,
        insufficient: true,
        balance: wallet.balance,
        required: cost,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Deduct
    const newBalance = wallet.balance - cost;
    const { error: updateError } = await serviceClient
      .from("gem_wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    if (updateError) throw new Error("Failed to deduct diamonds");

    // Record transaction
    const description = action === "content_unlock"
      ? `Unlocked premium content`
      : action === "image_gen"
        ? "In-chat image generation"
        : "Chat message";

    await serviceClient.from("gem_transactions").insert({
      user_id: userId,
      amount: -cost,
      type: action,
      description,
    });

    // If content unlock, record it
    if (action === "content_unlock" && content_id) {
      await serviceClient.from("content_unlocks").insert({
        user_id: userId,
        content_id,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deducted: cost,
      new_balance: newBalance,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 400,
    });
  }
});
