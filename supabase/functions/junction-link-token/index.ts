import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { patientId } = await req.json();
    
    if (!patientId) {
      return new Response(
        JSON.stringify({ error: 'Patient ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const junctionApiKey = Deno.env.get('JUNCTION_API_KEY');
    if (!junctionApiKey) {
      console.error('JUNCTION_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Junction API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, create or get the Junction user for this patient
    // Using the patient ID as a client_user_id to maintain mapping
    const userResponse = await fetch('https://api.tryvital.io/v2/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vital-api-key': junctionApiKey,
      },
      body: JSON.stringify({
        client_user_id: patientId,
      }),
    });

    let junctionUserId: string;

    if (userResponse.status === 409) {
      // User already exists, fetch by client_user_id
      const existingUserResponse = await fetch(
        `https://api.tryvital.io/v2/user/resolve/${patientId}`,
        {
          method: 'GET',
          headers: {
            'x-vital-api-key': junctionApiKey,
          },
        }
      );

      if (!existingUserResponse.ok) {
        const errorText = await existingUserResponse.text();
        console.error('Failed to resolve existing user:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to resolve patient in Junction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const existingUser = await existingUserResponse.json();
      junctionUserId = existingUser.user_id;
    } else if (userResponse.ok) {
      const newUser = await userResponse.json();
      junctionUserId = newUser.user_id;
    } else {
      const errorText = await userResponse.text();
      console.error('Failed to create Junction user:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create patient in Junction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now generate the link token for this user
    const linkTokenResponse = await fetch('https://api.tryvital.io/v2/link/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vital-api-key': junctionApiKey,
      },
      body: JSON.stringify({
        user_id: junctionUserId,
      }),
    });

    if (!linkTokenResponse.ok) {
      const errorText = await linkTokenResponse.text();
      console.error('Failed to generate link token:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate link token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const linkTokenData = await linkTokenResponse.json();
    console.log('Successfully generated link token for patient:', patientId);

    return new Response(
      JSON.stringify({ 
        link_token: linkTokenData.link_token,
        user_id: junctionUserId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
