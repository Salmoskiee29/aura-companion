import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DIAMOND_BUNDLES: Record<string, number> = {
  "price_1T17456Vjph7vzkpiV54mGRv": 100,
  "price_1T174P6Vjph7vzkpLBPk5ws3": 500,
  "price_1T174b6Vjph7vzkp1LyDiNJP": 1000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { priceId } = await req.json();
    const diamondAmount = DIAMOND_BUNDLES[priceId];
    if (!diamondAmount) throw new Error("Invalid diamond bundle");

    // Add diamonds to wallet
    const { data: wallet } = await supabaseClient
      .from("gem_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (wallet) {
      await supabaseClient
        .from("gem_wallets")
        .update({ balance: wallet.balance + diamondAmount })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("gem_wallets")
        .insert({ user_id: user.id, balance: diamondAmount });
    }

    // Record transaction
    await supabaseClient.from("gem_transactions").insert({
      user_id: user.id,
      amount: diamondAmount,
      type: "purchased",
      description: `Purchased ${diamondAmount} diamonds`,
    });

    return new Response(JSON.stringify({ success: true, diamonds_added: diamondAmount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
