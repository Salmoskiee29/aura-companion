import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_Tz5DgQ4CQX5Ns1": "basic",
  "prod_Tz5DNqIeI5Uu0M": "premium",
  "prod_Tz5ELzQabf9Ta1": "vip",
};

const TIER_LIMITS: Record<string, { daily_human_replies: number }> = {
  basic: { daily_human_replies: 15 },
  premium: { daily_human_replies: 50 },
  vip: { daily_human_replies: 999 },
};

// Diamond allocation per tier (reset monthly)
const TIER_DIAMONDS: Record<string, number> = {
  free: 10,
  basic: 50,
  premium: 150,
  vip: 500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Not authenticated");

    const user = userData.user;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const hasActiveSub = subscriptions.data.length > 0;

    let tier = "free";
    let subscriptionEnd = null;
    let previousTier = "free";

    // Get current subscription record to check previous tier
    const { data: currentSub } = await supabaseClient
      .from("subscriptions")
      .select("tier, current_period_end")
      .eq("user_id", user.id)
      .single();

    previousTier = currentSub?.tier || "free";
    const previousPeriodEnd = currentSub?.current_period_end || null;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      const productId = sub.items.data[0].price.product as string;
      tier = PRODUCT_TO_TIER[productId] || "basic";

      const limits = TIER_LIMITS[tier] || { daily_human_replies: 0 };

      // Update subscription record
      await supabaseClient
        .from("subscriptions")
        .update({
          status: "active",
          plan: tier,
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          current_period_end: subscriptionEnd,
          daily_human_replies_limit: limits.daily_human_replies,
        })
        .eq("user_id", user.id);

      // Monthly diamond reset logic:
      // Reset diamonds if:
      // 1. Tier changed (upgrade/downgrade)
      // 2. New billing period started (current_period_end changed)
      const tierChanged = tier !== previousTier;
      const periodChanged = subscriptionEnd !== previousPeriodEnd;

      if (tierChanged || periodChanged) {
        const diamondAllocation = TIER_DIAMONDS[tier] || 10;
        console.log(`[CHECK-SUB] Resetting diamonds for ${user.email}: tier=${tier}, allocation=${diamondAllocation}, reason=${tierChanged ? 'tier_change' : 'period_reset'}`);

        await supabaseClient
          .from("gem_wallets")
          .update({ balance: diamondAllocation })
          .eq("user_id", user.id);

        // Log the diamond reset
        await supabaseClient.from("gem_transactions").insert({
          user_id: user.id,
          amount: diamondAllocation,
          type: tierChanged ? "tier_allocation" : "monthly_reset",
          description: `${tierChanged ? 'Tier changed to' : 'Monthly reset for'} ${tier}: ${diamondAllocation} diamonds allocated`,
        });
      }
    } else {
      // No active subscription - downgrade to free
      if (previousTier !== "free") {
        // User lost their subscription, reset to free allocation
        const freeAllocation = TIER_DIAMONDS.free;
        await supabaseClient
          .from("gem_wallets")
          .update({ balance: freeAllocation })
          .eq("user_id", user.id);

        await supabaseClient.from("gem_transactions").insert({
          user_id: user.id,
          amount: freeAllocation,
          type: "tier_allocation",
          description: `Subscription expired, reset to free: ${freeAllocation} diamonds`,
        });
      }

      await supabaseClient
        .from("subscriptions")
        .update({ status: "inactive", plan: "free", tier: "free" })
        .eq("user_id", user.id);
    }

    // Get current diamond balance to return
    const { data: wallet } = await supabaseClient
      .from("gem_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      subscription_end: subscriptionEnd,
      diamond_balance: wallet?.balance ?? 0,
    }), {
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
