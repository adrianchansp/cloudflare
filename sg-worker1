export default {
  async fetch(request, env, ctx) {
  
    const url = new URL(request.url);
	const path = url.pathname;
	
// Extract CF headers

    const cf = request.cf || {};
    const country = cf.country || "Unknown";
    const email = request.headers.get("cf-access-identity-email");
    const timestamp = new Date().toISOString();

	if (!email) {
      return new Response("Unauthorized", { status: 401 });
    };

// /secure (authenticated HTML response)
	if (path === "/secure"){
      return new Response(`
        <html><body>
          ${email} authenticated at ${timestamp} from 
          <a href="/secure/${country}">${country}</a>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html' } }
	  );};

// /secure/${COUNTRY} (show flag)
	else if (path.startsWith("/secure/")) && (path !== "/secure") {	  
	  const flag = path.split("/")[2].toUpperCase();
      return fetch(`https://<your_R2_bucket>.r2.dev/flags/${flag}.png`, {
        headers: { 'Content-Type': 'image/png' }
      });
    };
	
    return new Response("Not found", { status: 404 });
  }
}
