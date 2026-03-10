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

  const MASTER_EMAIL = "yourmatchofficial@gmail.com";
  const MASTER_PASSWORD = "Administrator061225!";
  const MASTER_DISPLAY_NAME = "YourMatch Official";

  try {
    // Check if master admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const masterExists = existingUsers?.users?.some(u => u.email === MASTER_EMAIL);

    if (masterExists) {
      console.log("[SEED] Master admin already exists, skipping.");
      return new Response(JSON.stringify({ message: "Master admin already exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the master admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: MASTER_EMAIL,
      password: MASTER_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: MASTER_DISPLAY_NAME },
    });

    if (createError) throw new Error(createError.message);

    const userId = newUser.user.id;

    // The handle_new_user trigger creates profile + user_role='user' + subscription + wallet.
    // Update the role to 'developer' (master admin = developer role).
    await supabaseAdmin
      .from("user_roles")
      .update({ role: "developer" })
      .eq("user_id", userId);

    // Update the profile display name
    await supabaseAdmin
      .from("profiles")
      .update({ display_name: MASTER_DISPLAY_NAME, onboarding_completed: true })
      .eq("user_id", userId);

    console.log(`[SEED] Master admin created: ${MASTER_EMAIL}`);

    return new Response(JSON.stringify({ success: true, message: "Master admin created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[SEED] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
