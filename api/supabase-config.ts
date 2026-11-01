// Shared configuration reader compatible with server.ts and Vercel functions
export function getStoredSupabaseConfig() {
  const url = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://vgcftgxtpywmswxvztsm.supabase.co"
  ).trim();

  const key = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnY2Z0Z3h0cHl3bXN3eHZ6dHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTQxODAsImV4cCI6MjEwNTI5MDE4MH0.z0Ur4dFmbiDX9YY2rvnm7jqmgT6eU_7sd2Oqxxonq9k"
  ).trim();

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith("http"))
  };
}

// Handler for Express server in server.ts
export function handleGetSupabaseConfig(req: any, res: any) {
  try {
    const config = getStoredSupabaseConfig();
    return res.status(200).json(config);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to get config" });
  }
}

// Handler for saving config in server.ts
export function handleSaveSupabaseConfig(req: any, res: any) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { url, key } = body;

    if (!url || !key) {
      return res.status(400).json({ error: "Supabase URL and Anon Key are required" });
    }

    const trimmedUrl = String(url).trim();
    const trimmedKey = String(key).trim();

    process.env.VITE_SUPABASE_URL = trimmedUrl;
    process.env.VITE_SUPABASE_ANON_KEY = trimmedKey;
    process.env.SUPABASE_URL = trimmedUrl;
    process.env.SUPABASE_ANON_KEY = trimmedKey;

    return res.status(200).json({
      success: true,
      message: "Supabase credentials updated successfully",
      config: {
        url: trimmedUrl,
        key: trimmedKey,
        isConfigured: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to update configuration" });
  }
}

// Default export required for Vercel Serverless Function routing
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    return handleSaveSupabaseConfig(req, res);
  }

  return handleGetSupabaseConfig(req, res);
}
