import { handleUpload } from "@vercel/blob/client";

// Token endpoint for direct client -> Blob uploads (src/components/intake/IntakeForm.jsx).
// Images go straight from the browser to Blob storage, bypassing this app's own
// request body entirely — necessary because real photos routinely add up to well
// past the ~4.5MB body limit Vercel enforces on regular API routes.
export async function POST(request) {
  const body = await request.json();
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
    });
    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
