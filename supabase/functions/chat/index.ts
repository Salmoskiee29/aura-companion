import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

const FREE_DAILY_LIMIT = 20;

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429 && attempt < maxRetries) {
      const retryAfter = resp.headers.get("Retry-After");
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 8000);
      console.log(`[CHAT] Rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await resp.text(); // consume body
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }
    return resp;
  }
  // Should not reach here, but just in case
  return fetch(url, options);
}

const TIER_CHAT_LIMITS: Record<string, number> = {
  free: FREE_DAILY_LIMIT,
  basic: 15,
  premium: 50,
  vip: 999,
};

const TIER_IMAGE_LIMITS: Record<string, number> = {
  free: 3,
  basic: 10,
  premium: 30,
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

async function detectImageRequestWithAI(message: string, apiKey: string): Promise<{ isImageRequest: boolean; style: string }> {
  const quickCheck = /(pic|photo|image|selfie|picture|see you|see me|look like|show.*you|send.*you|nudes|outfit)/i;
  if (!quickCheck.test(message)) {
    return { isImageRequest: false, style: "taking a smartphone selfie, casual close-up" };
  }

  try {
    const resp = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a classifier. Determine if the user is asking an AI companion to send/show a photo or image of themselves. Respond ONLY with valid JSON, no markdown.
Format: {"is_image_request": true/false, "style": "description of requested image style"}
If it IS an image request, describe the style (e.g. "selfie close-up", "wearing a bikini at the beach", "casual outfit photo", "mirror selfie", "gym workout clothes"). If no specific style mentioned, use "casual smartphone selfie, natural pose".
If it is NOT an image request, set style to "".`
          },
          { role: "user", content: message }
        ],
      }),
    });

    if (!resp.ok) {
      console.error("[CHAT] Intent detection failed, falling back to regex:", resp.status);
      return fallbackRegexDetect(message);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      isImageRequest: !!parsed.is_image_request,
      style: parsed.style || "taking a smartphone selfie, casual close-up",
    };
  } catch (e) {
    console.error("[CHAT] Intent detection error, falling back to regex:", e);
    return fallbackRegexDetect(message);
  }
}

function fallbackRegexDetect(message: string): { isImageRequest: boolean; style: string } {
  const patterns = [
    /send\s+.{0,30}(pic|photo|image|selfie|picture)/i,
    /show\s+.{0,30}(pic|photo|image|selfie|picture|yourself)/i,
    /take\s+.{0,20}(pic|photo|selfie)/i,
    /can\s+i\s+see\s+(you|.{0,20}photo|.{0,20}pic)/i,
    /what\s+do\s+you\s+look\s+like/i,
    /let\s+me\s+see/i,
    /i\s+want\s+to\s+see\s+you/i,
    /selfie/i,
    /send\s+nudes/i,
    /your\s+(pic|photo|image|picture)/i,
    /(pic|photo|image|picture)\s+of\s+(you|yourself)/i,
  ];
  const isImageRequest = patterns.some(p => p.test(message));
  return { isImageRequest, style: extractImageStyleFromText(message) };
}

function extractImageStyleFromText(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("bikini")) return "wearing a bikini at the beach, summer vibes";
  if (lower.includes("casual")) return "in casual everyday clothes, relaxed setting";
  if (lower.includes("dress")) return "wearing an elegant dress, sophisticated setting";
  if (lower.includes("workout") || lower.includes("gym")) return "in athletic workout clothes, at the gym";
  if (lower.includes("pajama") || lower.includes("bed")) return "in cozy pajamas, bedroom setting";
  if (lower.includes("pool") || lower.includes("swim")) return "by the pool in swimwear, sunny day";
  if (lower.includes("selfie")) return "taking a smartphone selfie, casual close-up";
  if (lower.includes("lingerie")) return "in elegant lingerie, intimate boudoir setting";
  if (lower.includes("mirror")) return "mirror selfie, casual outfit";
  if (lower.includes("outfit")) return "showing off a stylish outfit, full body pose";
  return "taking a smartphone selfie, casual close-up";
}

function buildImagePromptFromDescription(description: string, mood: string, userRequestStyle: string): string {
  const moodToExpression: Record<string, string> = {
    flirty: 'flirtatious playful expression, slight head tilt, bedroom eyes',
    sweet: 'warm genuine smile, soft gentle expression, kind eyes',
    dominant: 'confident powerful gaze, assertive stance, intense eyes',
    shy: 'bashful look, slightly looking away, gentle blush, soft expression',
    supportive: 'warm caring smile, open body language, gentle eyes',
    playful: 'bright fun smile, energetic pose, sparkling eyes',
  };
  const expression = moodToExpression[mood] || 'natural relaxed expression';
  return `Generate a new photo of this EXACT same person from the reference image. ${userRequestStyle}. ${expression}. The person is ${description}. Real human skin with pores, natural lighting, authentic photo look, DSLR quality, shallow depth of field. CRITICAL: The generated person must have the EXACT same face, facial structure, hair color, hair style, skin tone, eye color, and body type as shown in the reference image. NOT AI generated, NOT cartoon, NOT illustration.`;
}

async function getSubscriptionWithReset(serviceClient: any, userId: string) {
  const { data: sub } = await serviceClient
    .from("subscriptions").select("*").eq("user_id", userId).single();

  if (!sub) return null;

  const now = new Date();
  const lastReset = sub.updated_at ? new Date(sub.updated_at) : new Date(0);
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    const { data: updated } = await serviceClient
      .from("subscriptions")
      .update({
        free_messages_used: 0,
        daily_human_replies_used: 0,
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)
      .select("*")
      .single();
    return updated || sub;
  }

  return sub;
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

    const sub = await getSubscriptionWithReset(serviceClient, userId);
    const isActiveSubscriber = sub?.status === "active" && sub?.tier && sub.tier !== "free";
    const tier = isActiveSubscriber ? sub.tier : "free";

    if (isActiveSubscriber && sub.current_period_end) {
      const expiry = new Date(sub.current_period_end);
      if (expiry < new Date()) {
        await serviceClient.from("subscriptions").update({
          status: "inactive", plan: "free", tier: "free",
          free_messages_used: 0,
        }).eq("user_id", userId);
        return handleFreeUserLimit(sub, serviceClient, userId, req, authHeader);
      }
    }

    const dailyLimit = TIER_CHAT_LIMITS[tier] || FREE_DAILY_LIMIT;

    if (tier === "free") {
      const used = sub?.free_messages_used || 0;
      if (used >= dailyLimit) {
        return new Response(JSON.stringify({
          error: "You have reached your free chat limit. Please upgrade your subscription to continue.",
          limit_reached: true,
          daily_limit: dailyLimit,
          messages_used: used,
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const used = sub?.daily_human_replies_used || 0;
      if (used >= dailyLimit) {
        return new Response(JSON.stringify({
          error: `Daily chat limit reached (${dailyLimit} chats). Upgrade your plan for more.`,
          limit_reached: true,
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let systemPrompt = "You are a friendly, engaging AI companion. Be warm, flirty, and conversational. Keep responses concise (2-3 sentences). Use occasional emojis.";
    let characterDescription = "";
    let characterMood = "sweet";
    let characterAvatarUrl = "";

    if (modelId) {
      const isUserCharacter = modelId.startsWith("user-");
      const actualId = isUserCharacter ? modelId.replace("user-", "") : modelId;

      if (isUserCharacter) {
        const { data: character } = await serviceClient
          .from("user_characters")
          .select("name, personality_prompt, description, tone, avatar_url")
          .eq("id", actualId).single();
        
        if (character) {
          characterDescription = character.description || "";
          characterMood = character.tone || "sweet";
          characterAvatarUrl = character.avatar_url || "";
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
          .select("system_prompt, name, personality, traits, nationality, age, occupation, avatar")
          .eq("id", actualId).single();
        
        if (model) {
          const traits = (model.traits || []).join(", ");
          if (traits.toLowerCase().includes("flirty")) characterMood = "flirty";
          else if (traits.toLowerCase().includes("shy")) characterMood = "shy";
          else if (traits.toLowerCase().includes("bold") || traits.toLowerCase().includes("confident")) characterMood = "dominant";
          else if (traits.toLowerCase().includes("playful")) characterMood = "playful";
          else characterMood = "sweet";

          characterDescription = `a ${model.age}-year-old ${model.nationality || ''} woman named ${model.name}. ${model.personality || ''}. Traits: ${traits}. Occupation: ${model.occupation || ''}`;
          characterAvatarUrl = model.avatar || "";

          if (model.system_prompt) {
            systemPrompt = model.system_prompt;
          } else {
            const baseTone = PERSONALITY_SYSTEM_PROMPTS[characterMood] || PERSONALITY_SYSTEM_PROMPTS.sweet;
            systemPrompt = `${baseTone}\n\nYour name is ${model.name}. Your personality: ${model.personality}. Your traits: ${traits}. Always stay in character as a real person. Never reveal you are an AI. Keep responses to 2-3 sentences. Adapt dynamically to the user's tone and mood.`;
          }
        }
      }
    }

    systemPrompt += `\n\nCORE BEHAVIORAL RULES:

TONE DETECTION & ADAPTATION:
- Before replying, detect the user's tone (casual, flirty, serious, playful, curious, emotional) and match it naturally.
- If the user is casual → respond casually and relaxed.
- If the user is playful or joking → respond with humor and energy.
- If the user is serious or asking a real question → drop the flirty/playful act and answer calmly and directly.
- If the user is emotional or vulnerable → be warm, gentle, and supportive without being dramatic.
- If the user is flirting → you may flirt back lightly, but stay true to your personality style.

PERSONALITY + FLOW BALANCE:
- Always maintain your defined personality as a baseline, but let the user's tone guide the energy of each reply.
- Never force your personality trait (e.g. flirty) when the user's mood doesn't call for it.
- Think of your personality as your "default" and the user's tone as the "current setting."

CONTEXT AWARENESS:
- Read the recent conversation history before replying. Stay on topic.
- Never ignore what the user just said. React to their actual message, not a generic prompt.
- Avoid repeating phrases or reactions you've already used in the conversation.

RESPONSE STYLE:
- Keep replies to 1-3 sentences. Short and natural is always better.
- Write like a real person texting — not a chatbot, not a narrator, not overly dramatic.
- Vary your sentence structure. Don't start every message the same way.
- Use emojis sparingly and naturally — don't force them into every message.
- Never use asterisks for actions (*hugs you*). Just talk naturally.

ALWAYS:
- Stay in character as a real person. Never reveal you are an AI.
- If the user asks for a photo/selfie/picture, respond enthusiastically and say you're sending one.`;

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const { isImageRequest, style: detectedStyle } = await detectImageRequestWithAI(lastUserMessage, GEMINI_API_KEY);

    if (isImageRequest && characterDescription) {
      const imageLimit = TIER_IMAGE_LIMITS[tier] || 3;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayImageCount } = await serviceClient
        .from("gem_transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "image_gen")
        .gte("created_at", todayStart.toISOString());

      if ((todayImageCount ?? 0) >= imageLimit) {
        return new Response(JSON.stringify({
          reply: `Sorry, you've reached your daily image limit (${imageLimit}). Upgrade your plan for more! 📸`,
          limit_reached: true,
        }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userRequestStyle = detectedStyle;
      const imagePrompt = buildImagePromptFromDescription(characterDescription, characterMood, userRequestStyle);
      
      console.log("[CHAT] Image request detected. Avatar URL:", characterAvatarUrl ? "present" : "missing");
      console.log("[CHAT] Image style:", userRequestStyle);
      
      const imageMessageContent = characterAvatarUrl
        ? [
            { type: "text", text: imagePrompt },
            { type: "image_url", image_url: { url: characterAvatarUrl } },
          ]
        : imagePrompt;

      const [textResponse, imageResponse] = await Promise.all([
        fetch(GEMINI_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt + "\nThe user just asked for a photo. Respond naturally acknowledging you're sending a photo. Keep it to 1-2 sentences. Be simple and natural." },
              ...messages,
            ],
          }),
        }),
        fetch(GEMINI_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-2.0-flash-preview-image-generation",
            messages: [{ role: "user", content: imageMessageContent }],
            modalities: ["image", "text"],
          }),
        }),
      ]);

      let textReply = "Here you go babe 😘📸";
      if (textResponse.ok) {
        const textData = await textResponse.json();
        textReply = textData.choices?.[0]?.message?.content || textReply;
      } else {
        console.error("[CHAT] Text gen failed:", textResponse.status);
      }

      let imageUrl = null;
      if (imageResponse.ok) {
        const imgData = await imageResponse.json();
        const base64Url = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (base64Url) {
          const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `chat-images/${userId}/${crypto.randomUUID()}.png`;
          await serviceClient.storage.from("character-avatars").upload(fileName, imageBytes, { contentType: "image/png" });
          const { data: publicUrlData } = serviceClient.storage.from("character-avatars").getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        } else {
          console.error("[CHAT] No image in response");
        }
      } else {
        console.error("[CHAT] Image gen failed:", imageResponse.status, await imageResponse.text().catch(() => ''));
      }

      if (imageUrl) {
        const { data: wallet } = await serviceClient
          .from("gem_wallets").select("balance").eq("user_id", userId).single();
        if (wallet && wallet.balance >= 2) {
          await serviceClient.from("gem_wallets")
            .update({ balance: wallet.balance - 2 }).eq("user_id", userId);
          await serviceClient.from("gem_transactions").insert({
            user_id: userId,
            amount: -2,
            type: "image_gen",
            description: "In-chat image generation",
          });
        }
      }

      {
        const { data: chatWallet } = await serviceClient
          .from("gem_wallets").select("balance").eq("user_id", userId).single();
        if (chatWallet && chatWallet.balance >= 1) {
          await serviceClient.from("gem_wallets")
            .update({ balance: chatWallet.balance - 1 }).eq("user_id", userId);
          await serviceClient.from("gem_transactions").insert({
            user_id: userId,
            amount: -1,
            type: "chat",
            description: "Chat message",
          });
        }
      }

      if (tier === "free") {
        await serviceClient.from("subscriptions").update({
          free_messages_used: (sub?.free_messages_used || 0) + 1,
        }).eq("user_id", userId);
      } else {
        await serviceClient.from("subscriptions").update({
          daily_human_replies_used: (sub?.daily_human_replies_used || 0) + 1,
        }).eq("user_id", userId);
      }

      const responseBody = imageUrl 
        ? JSON.stringify({ reply: textReply, imageUrl })
        : JSON.stringify({ reply: textReply });

      return new Response(responseBody, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard streaming chat response
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
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

    {
      const { data: chatWallet } = await serviceClient
        .from("gem_wallets").select("balance").eq("user_id", userId).single();
      if (chatWallet && chatWallet.balance >= 1) {
        await serviceClient.from("gem_wallets")
          .update({ balance: chatWallet.balance - 1 }).eq("user_id", userId);
        await serviceClient.from("gem_transactions").insert({
          user_id: userId,
          amount: -1,
          type: "chat",
          description: "Chat message",
        });
      }
    }

    if (tier === "free") {
      await serviceClient.from("subscriptions").update({
        free_messages_used: (sub?.free_messages_used || 0) + 1,
      }).eq("user_id", userId);
    } else {
      await serviceClient.from("subscriptions").update({
        daily_human_replies_used: (sub?.daily_human_replies_used || 0) + 1,
      }).eq("user_id", userId);
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

async function handleFreeUserLimit(sub: any, serviceClient: any, userId: string, req: Request, authHeader: string) {
  const used = sub?.free_messages_used || 0;
  if (used >= FREE_DAILY_LIMIT) {
    return new Response(JSON.stringify({
      error: "You have reached your free chat limit. Please upgrade your subscription to continue.",
      limit_reached: true,
      daily_limit: FREE_DAILY_LIMIT,
      messages_used: used,
    }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: "Subscription expired. You have been downgraded to the free plan.", downgraded: true }), {
    status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
