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

const TIER_LIMITS: Record<string, { daily_human_replies: number; daily_gems: number }> = {
  basic: { daily_human_replies: 15, daily_gems: 0 },
  premium: { daily_human_replies: 50, daily_gems: 50 },
  vip: { daily_human_replies: 999, daily_gems: 150 },
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

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      const productId = sub.items.data[0].price.product as string;
      tier = PRODUCT_TO_TIER[productId] || "basic";

      const limits = TIER_LIMITS[tier] || { daily_human_replies: 0, daily_gems: 0 };

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
    } else {
      await supabaseClient
        .from("subscriptions")
        .update({ status: "inactive", plan: "free", tier: "free" })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      subscription_end: subscriptionEnd,
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
