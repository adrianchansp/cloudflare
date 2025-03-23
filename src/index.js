export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Get authenticated user email from Cloudflare Access
      const email = request.headers.get("cf-access-authenticated-user-email");
      const country = request.cf?.country || "Unknown";
      const timestamp = new Date().toISOString();

      // If not authenticated
      if (!email) {
        return new Response("Unauthorized – Are you logged in via Cloudflare Access?", {
          status: 401,
          headers: { "Content-Type": "text/plain" }
        });
      }

      // /secure – display user info
      if (pathname === "/secure") {
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head><title>Secure Page</title></head>
            <body>
              <h1>${email} authenticated at ${timestamp} from 
                <a href="/secure/${country}">${country}</a>
              </h1>
            </body>
          </html>
        `, {
          headers: { "Content-Type": "text/html" }
        });
      }

      // /secure/COUNTRY – return flag from R2
      const match = pathname.match(/^\/secure\/([A-Z]{2})$/);
      if (match) {
        const countryCode = match[1];
        const fileKey = `${countryCode.toLowerCase()}.png`; // match file name in R2

        const object = await env.FLAG_BUCKET.get(fileKey);

        if (!object) {
          return new Response("Flag not found in R2", { status: 404 });
        }

        return new Response(object.body, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }

      // Not found fallback
      return new Response("Not Found", { status: 404 });

    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
}
