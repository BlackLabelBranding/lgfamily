import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { SignJWT, importPKCS8 } from 'https://esm.sh/jose@5.2.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 1. IMMEDIATELY HANDLE OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { mode = 'both' } = await req.json().catch(() => ({}));

    const gEmail = Deno.env.get('G_SERVICE_ACCOUNT_EMAIL');
    const gKeyRaw = Deno.env.get('G_PRIVATE_KEY');

    if (!gEmail || !gKeyRaw) {
      throw new Error('Missing Google Credentials in Supabase Secrets');
    }

    const gKey = gKeyRaw.replace(/\\n/g, '\n');
    const privateKey = await importPKCS8(gKey, 'RS256');
    const token = await new SignJWT({
      iss: gEmail,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google Auth Failed: ${errText}`);
    }

    const { access_token } = await tokenRes.json();

    const { data: connections } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('is_enabled', true);

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
      status: 400,
    });
  }
});
