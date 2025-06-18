export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const value = url.searchParams.get("value");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Ответ на preflight-запрос
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "GET") {
      if (!key) return new Response("Missing 'key'", { status: 400, headers: corsHeaders });

      const stored = await env.ID.get(key);
      return new Response(stored ?? "null", {
        headers: {
          ...corsHeaders,
          "content-type": "text/plain",
        },
      });
    }

    if (request.method === "POST") {
      if (!key || !value)
        return new Response("Missing 'key' or 'value'", { status: 400, headers: corsHeaders });

      await env.ID.put(key, value);
      return new Response(`Stored: ${key} = ${value}`, { headers: corsHeaders });
    }

    return new Response("Use GET or POST", { status: 405, headers: corsHeaders });
  },
};
