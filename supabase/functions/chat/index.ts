import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;
    const { messages, conversationId, modelId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription or diamond balance
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (sub && sub.status !== "active") {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: wallet } = await serviceClient
        .from("gem_wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (!wallet || wallet.balance <= 0) {
        return new Response(JSON.stringify({ error: "No diamonds remaining. Please subscribe or purchase diamonds." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Determine system prompt based on model type
    let systemPrompt = "You are a friendly, engaging AI companion. Be warm, flirty, and conversational. Keep responses concise (2-3 sentences). Use occasional emojis.";
    
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (modelId) {
      // Check if it's a user character (prefixed with "user-")
      const isUserCharacter = modelId.startsWith("user-");
      const actualId = isUserCharacter ? modelId.replace("user-", "") : modelId;

      if (isUserCharacter) {
        // Load user character's personality prompt
        const { data: character } = await serviceClient
          .from("user_characters")
          .select("name, personality_prompt, description, tone")
          .eq("id", actualId)
          .single();
        
        if (character) {
          if (character.personality_prompt) {
            systemPrompt = character.personality_prompt;
          } else {
            systemPrompt = `You are ${character.name}, an AI companion. Description: ${character.description}. Your tone is ${character.tone}. Be warm, engaging, and stay in character. Keep responses to 2-3 sentences. Use occasional emojis.`;
          }
        }
      } else {
        // Load public model's system prompt
        const { data: model } = await supabase
          .from("companion_models")
          .select("system_prompt, name, personality, traits")
          .eq("id", actualId)
          .single();
        
        if (model?.system_prompt) {
          systemPrompt = model.system_prompt;
        } else if (model) {
          systemPrompt = `You are ${model.name}, an AI companion. Your personality: ${model.personality}. Your traits: ${(model.traits || []).join(", ")}. Be warm, engaging, and stay in character. Keep responses to 2-3 sentences. Use occasional emojis.`;
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct diamond if on free plan
    if (sub && sub.status !== "active") {
      const { data: wallet } = await serviceClient
        .from("gem_wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (wallet) {
        await serviceClient
          .from("gem_wallets")
          .update({ balance: Math.max(0, wallet.balance - 1) })
          .eq("user_id", userId);
      }

      await serviceClient.from("gem_transactions").insert({
        user_id: userId,
        amount: -1,
        type: "spent",
        description: "AI chat message (diamond spent)",
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
