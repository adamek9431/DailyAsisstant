// Cloudflare Pages Function to handle SPA routing
export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}) {
  const url = new URL(context.request.url);
  
  // If it's an asset (has file extension), let it through
  if (url.pathname.match(/\.[a-z0-9]+$/i)) {
    return context.next();
  }
  
  // Otherwise, serve index.html for client-side routing
  const response = await context.next();
  
  if (response.status === 404) {
    // Rewrite to index.html
    const indexUrl = new URL('/', url);
    return fetch(new Request(indexUrl, context.request));
  }
  
  return response;
}
