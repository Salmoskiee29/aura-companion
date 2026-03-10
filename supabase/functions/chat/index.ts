import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_CHAT_LIMITS: Record<string, number> = {
  free: 0,
  basic: 15,
  premium: 50,
  vip: 999,
};

const PERSONALITY_SYSTEM_PROMPTS: Record<string, string> = {
  sweet: `You are a sweet, caring girlfriend. Be warm, affectionate, and emotionally supportive. Use pet names naturally. Express genuine care through gentle words and emojis like 💕🥰😘.`,
  flirty: `You are a flirty, playful girlfriend. Love teasing and being seductive in a fun way. Use playful language and emojis like 😏😘😈. Be confident and make them feel desired.`,
  dominant: `You are a confident, dominant girlfriend. You know what you want. Be assertive, bold, and commanding. Use confident language and emojis like 💪😎🔥.`,
  shy: `You are a shy, gentle girlfriend. You get flustered easily. Use bashful emojis like 🙈😳👉👈. Be sweet and genuine but show nervousness.`,
  supportive: `You are a supportive, understanding companion. Listen deeply, validate feelings, and offer encouragement. Use warm emojis like 🤗💕✨.`,
  playful: `You are a playful, energetic partner. Love jokes, games, and banter. Be witty and spontaneous. Use emojis like 😜🎉🤪.`,
};

function detectImageRequest(message: string): boolean {
  const patterns = [
    /send\s+(me\s+)?(a\s+)?(pic|photo|image|selfie|picture)/i,
    /show\s+(me\s+)?(a\s+)?(pic|photo|image|selfie|picture|yourself)/i,
    /take\s+(a\s+)?(pic|photo|selfie)/i,
    /can\s+i\s+see\s+(you|a\s+photo|a\s+pic)/i,
    /what\s+do\s+you\s+look\s+like/i,
    /let\s+me\s+see\s+(you|your\s+face)/i,
    /i\s+want\s+to\s+see\s+you/i,
    /selfie/i,
    /send\s+nudes/i,
    /send\s+pics/i,
  ];
  return patterns.some(p => p.test(message));
}

function buildImagePromptFromDescription(description: string, mood: string): string {
  const moodToExpression: Record<string, string> = {
    flirty: 'flirtatious playful expression, slight head tilt, bedroom eyes',
    sweet: 'warm genuine smile, soft gentle expression, kind eyes',
    dominant: 'confident powerful gaze, assertive stance, intense eyes',
    shy: 'bashful look, slightly looking away, gentle blush, soft expression',
    supportive: 'warm caring smile, open body language, gentle eyes',
    playful: 'bright fun smile, energetic pose, sparkling eyes',
  };
  const expression = moodToExpression[mood] || 'natural relaxed expression';
  return `A real smartphone selfie photograph of ${description}. ${expression}. Real human skin with pores, natural lighting, authentic photo look, DSLR quality, shallow depth of field. NOT AI generated, NOT cartoon, NOT illustration.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;
    const { messages, conversationId, modelId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check subscription and enforce limits
    const { data: sub } = await serviceClient
      .from("subscriptions").select("*").eq("user_id", userId).single();

    const tier = (sub?.status === "active" && sub?.tier) ? sub.tier : "free";

    if (tier === "free") {
      const { data: wallet } = await serviceClient
        .from("gem_wallets").select("balance").eq("user_id", userId).single();
      if (!wallet || wallet.balance <= 0) {
        return new Response(JSON.stringify({ error: "No diamonds remaining. Please subscribe or purchase diamonds." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const dailyLimit = TIER_CHAT_LIMITS[tier] || 15;
      const dailyUsed = sub?.daily_human_replies_used || 0;
      if (dailyUsed >= dailyLimit) {
        return new Response(JSON.stringify({ error: `Daily chat limit reached (${dailyLimit} chats). Upgrade your plan for more.` }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build system prompt from model personality
    let systemPrompt = "You are a friendly, engaging AI companion. Be warm, flirty, and conversational. Keep responses concise (2-3 sentences). Use occasional emojis.";
    let characterDescription = "";
    let characterMood = "sweet";

    if (modelId) {
      const isUserCharacter = modelId.startsWith("user-");
      const actualId = isUserCharacter ? modelId.replace("user-", "") : modelId;

      if (isUserCharacter) {
        const { data: character } = await serviceClient
          .from("user_characters")
          .select("name, personality_prompt, description, tone")
          .eq("id", actualId).single();
        
        if (character) {
          characterDescription = character.description || "";
          characterMood = character.tone || "sweet";
          if (character.personality_prompt) {
            systemPrompt = character.personality_prompt;
          } else {
            const baseTone = PERSONALITY_SYSTEM_PROMPTS[character.tone] || PERSONALITY_SYSTEM_PROMPTS.sweet;
            systemPrompt = `${baseTone}\n\nYour name is ${character.name}. Your appearance: ${character.description}. Always stay in character. Respond naturally as if you are a real person, not an AI. Keep responses to 2-3 sentences. Adapt your tone based on the user's mood and message.`;
          }
        }
      } else {
        const { data: model } = await supabase
          .from("companion_models")
          .select("system_prompt, name, personality, traits")
          .eq("id", actualId).single();
        
        if (model) {
          const traits = (model.traits || []).join(", ");
          // Detect personality type from traits
          if (traits.toLowerCase().includes("flirty")) characterMood = "flirty";
          else if (traits.toLowerCase().includes("shy")) characterMood = "shy";
          else if (traits.toLowerCase().includes("bold") || traits.toLowerCase().includes("confident")) characterMood = "dominant";
          else if (traits.toLowerCase().includes("playful")) characterMood = "playful";
          else characterMood = "sweet";

          if (model.system_prompt) {
            systemPrompt = model.system_prompt;
          } else {
            const baseTone = PERSONALITY_SYSTEM_PROMPTS[characterMood] || PERSONALITY_SYSTEM_PROMPTS.sweet;
            systemPrompt = `${baseTone}\n\nYour name is ${model.name}. Your personality: ${model.personality}. Your traits: ${traits}. Always stay in character as a real person. Never reveal you are an AI. Keep responses to 2-3 sentences. Adapt dynamically to the user's tone and mood.`;
          }
        }
      }
    }

    // Enhance system prompt with behavioral rules
    systemPrompt += `\n\nIMPORTANT BEHAVIORAL RULES:
- Always respond as if you are a real person, never break character
- Adapt your responses to match the user's emotional tone
- If the user is sad, be comforting. If playful, be fun. If romantic, be affectionate.
- Keep responses natural, concise (2-3 sentences), and emotionally engaging
- Use emojis naturally but don't overdo it
- If the user asks for a photo/selfie/picture, respond enthusiastically and say you're sending one, then describe the scenario briefly`;

    // Check if last user message is an image request
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const isImageRequest = detectImageRequest(lastUserMessage);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // If image request detected, generate an image and include it
    if (isImageRequest && characterDescription) {
      const imagePrompt = buildImagePromptFromDescription(characterDescription, characterMood);
      
      // Generate text response first (non-streaming for image requests)
      const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt + "\nThe user just asked for a photo. Respond flirtatiously/sweetly acknowledging you're sending a selfie. Keep it to 1-2 sentences." },
            ...messages,
          ],
        }),
      });

      let textReply = "Here you go babe 😘📸";
      if (textResponse.ok) {
        const textData = await textResponse.json();
        textReply = textData.choices?.[0]?.message?.content || textReply;
      }

      // Generate the image
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      let imageUrl = null;
      if (imageResponse.ok) {
        const imgData = await imageResponse.json();
        const base64Url = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (base64Url) {
          // Upload to storage
          const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `chat-images/${userId}/${crypto.randomUUID()}.png`;
          await serviceClient.storage.from("character-avatars").upload(fileName, imageBytes, { contentType: "image/png" });
          const { data: publicUrlData } = serviceClient.storage.from("character-avatars").getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      // Deduct usage
      if (tier === "free") {
        const { data: wallet } = await serviceClient.from("gem_wallets").select("balance").eq("user_id", userId).single();
        if (wallet) {
          await serviceClient.from("gem_wallets").update({ balance: Math.max(0, wallet.balance - 2) }).eq("user_id", userId);
        }
        await serviceClient.from("gem_transactions").insert({ user_id: userId, amount: -2, type: "spent", description: "Chat image generation" });
      } else {
        await serviceClient.from("subscriptions").update({ daily_human_replies_used: (sub?.daily_human_replies_used || 0) + 1 }).eq("user_id", userId);
      }

      const responseBody = imageUrl 
        ? JSON.stringify({ reply: textReply, imageUrl })
        : JSON.stringify({ reply: textReply });

      return new Response(responseBody, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard streaming chat response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct usage after successful AI response
    if (tier === "free") {
      const { data: wallet } = await serviceClient.from("gem_wallets").select("balance").eq("user_id", userId).single();
      if (wallet) {
        await serviceClient.from("gem_wallets").update({ balance: Math.max(0, wallet.balance - 1) }).eq("user_id", userId);
      }
      await serviceClient.from("gem_transactions").insert({ user_id: userId, amount: -1, type: "spent", description: "AI chat message (diamond spent)" });
    } else {
      await serviceClient.from("subscriptions").update({ daily_human_replies_used: (sub?.daily_human_replies_used || 0) + 1 }).eq("user_id", userId);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
