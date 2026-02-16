import type { Context } from "@netlify/functions";

/**
 * Netlify Function: Gemini API Proxy
 * APIキーをサーバーサイドに隠蔽し、フロントエンドから安全にAPIを呼び出す。
 *
 * POST /.netlify/functions/gemini-proxy
 * Body: { url: string, body: string }
 * → Google Generative AI API
 */
export default async (req: Request, _context: Context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { url, body } = await req.json();

    // URLにAPIキーを付与
    const targetUrl = url.includes("?")
      ? `${url}&key=${apiKey}`
      : `${url}?key=${apiKey}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
