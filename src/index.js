export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Extract CF headers
    const cf = request.cf || {};
    const country = cf.country || "Unknown";
    const email = request.headers.get("cf-access-identity-email");
    const timestamp = new Date().toISOString();

    // Handle unauthorized users
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // /secure - Return authenticated HTML
    if (path === "/secure") {
      return new Response(`
        <html><body>
          ${email} authenticated at ${timestamp} from 
          <a href="/secure/${country}">${country}</a>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // /secure/{COUNTRY} - Return flag image from R2
    else if (path.startsWith("/secure/") && path !== "/secure") {
      const flag = path.split("/")[2].toLowerCase(); // lowercase for file name

      const object = await env.FLAG_BUCKET.get(`${flag}.png`);
      if (!object) {
        return new Response("Flag not found", { status: 404 });
      }

      return new Response(object.body, {
        headers: { 'Content-Type': 'image/png' }
      });
    }

    // Catch-all
    return new Response("Not found", { status: 404 });
  }
};
