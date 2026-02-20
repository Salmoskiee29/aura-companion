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
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check caller's role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    const callerRole = roleData?.role;
    if (callerRole !== "admin" && callerRole !== "developer") {
      throw new Error("Only admins and developers can create accounts");
    }

    const { email, password, role } = await req.json();
    if (!email || !password || !role) throw new Error("Missing email, password, or role");

    // Developers can create any role; admins can only create chatter/user
    if (role === "admin" && callerRole !== "developer") {
      throw new Error("Only developers can create admin accounts");
    }
    if (role === "developer") {
      throw new Error("Developer accounts cannot be created through this interface");
    }
    if (!["user", "chatter", "admin"].includes(role)) {
      throw new Error("Invalid role. Must be 'user', 'chatter', or 'admin'");
    }

    // Create user via admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw new Error(createError.message);

    const newUserId = newUser.user.id;

    // The trigger handle_new_user creates profile, user_role='user', and subscription.
    // We need to update the role to the desired one.
    await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("user_id", newUserId);

    // If creating a chatter, also create their chatters record
    if (role === "chatter") {
      await supabaseAdmin.from("chatters").insert({
        user_id: newUserId,
        status: "offline",
        max_capacity: 10,
        active_conversations: 0,
      });
    }

    console.log(`[ADMIN-CREATE-USER] Created ${role} account: ${email}`);

    return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ADMIN-CREATE-USER] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
