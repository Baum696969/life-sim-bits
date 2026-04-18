// Edge Function: Generates a sound effect or music clip via ElevenLabs and returns audio bytes.
// Used as a one-time tool by developers (and could be cached/uploaded to storage).
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { type, prompt, duration_seconds, music_length_ms } = await req.json();

    let url = "";
    let body: Record<string, unknown> = {};

    if (type === "music") {
      url = "https://api.elevenlabs.io/v1/music";
      body = { prompt, music_length_ms: music_length_ms ?? 30000 };
    } else {
      url = "https://api.elevenlabs.io/v1/sound-generation";
      body = {
        text: prompt,
        duration_seconds: duration_seconds ?? 1.0,
        prompt_influence: 0.5,
      };
    }

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("ElevenLabs error:", r.status, txt);
      return new Response(
        JSON.stringify({ error: `ElevenLabs ${r.status}: ${txt}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const audioBuffer = await r.arrayBuffer();
    const base64 = base64Encode(new Uint8Array(audioBuffer));

    return new Response(
      JSON.stringify({ audio_base64: base64 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-sound error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
