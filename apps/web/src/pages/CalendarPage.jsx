import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // STEP 1: IMMEDIATELY HANDLE OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // STEP 2: SETUP CLIENTS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get the request body
    const { mode = 'both' } = await req.json().catch(() => ({}));

    // STEP 3: AUTH WITH GOOGLE
    const gEmail = Deno.env.get('G_SERVICE_ACCOUNT_EMAIL');
    const gKey = Deno.env.get('G_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!gEmail || !gKey) {
      throw new Error('Missing Google Credentials in Supabase Secrets');
    }

    const jwt = await create({ alg: "RS256", typ: "JWT" }, {
      iss: gEmail,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    }, gKey);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const { access_token } = await tokenRes.json();

    // STEP 4: FETCH AND SYNC
    const { data: connections } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('is_enabled', true);

    // Simple loop to push events
    for (const conn of connections || []) {
      const { data: events } = await supabase
        .from('family_events')
        .select('*')
        .eq('household_id', conn.household_id);

      for (const event of events || []) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            summary: event.title,
            location: event.location,
            description: event.description,
            start: event.all_day ? { date: event.start_at.split('T')[0] } : { dateTime: event.start_at },
            end: event.all_day ? { date: event.end_at.split('T')[0] } : { dateTime: event.end_at },
          }),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, message: 'Sync complete' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Critical Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Changed from 500 to 400 to ensure "HTTP OK" logic isn't tripped
    });
  }
});
