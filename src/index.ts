export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const value = url.searchParams.get("value");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 🟡 Выделяем ключ из пути
    let path = url.pathname;
    if (path === "/") path = "/index.html";

    const isApiRequest = path !== "/index.html";
    const key = isApiRequest ? path.slice(1) : null;

    // ✅ GET /key → прочитать из KV
    if (request.method === "GET" && key) {
      const stored = await env.ID.get(key);
      return new Response(stored ?? "null", {
        headers: {
          "content-type": "text/plain",
          ...corsHeaders,
        },
      });
    }

    // ✅ POST /key?value=... → записать в KV
    if (request.method === "POST" && key && value) {
      await env.ID.put(key, value);
      return new Response(`Stored: ${key} = ${value}`, {
        headers: corsHeaders,
      });
    }

    // 🧱 Отдать файл из public
    const file = await env.ASSETS.get(path.slice(1), { type: "stream" });

    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    const ext = path.split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      png: "image/png",
      jpg: "image/jpeg",
      svg: "image/svg+xml",
    };

    const contentType = mimeTypes[ext] ?? "application/octet-stream";

    return new Response(file as ReadableStream, {
      headers: {
        "content-type": contentType,
        ...corsHeaders,
      },
    });
  },
};
