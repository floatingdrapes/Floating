import crypto from "crypto";

export async function handleAdminVerify(req: any, res: any) {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "boopathiakasanjay@gmail.com";
    const SECRET_SALT = process.env.ADMIN_SECRET_KEY || "fd_master_secret_hash_salt_2026";

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { token } = body;
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return res.status(401).json({ valid: false });
    }

    // Handle Supabase Auth token format: "sb.<timestamp>.<hash>"
    if (token.startsWith("sb.")) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const timestamp = parseInt(parts[1], 10);
        if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
          return res.status(401).json({ valid: false, error: "Session expired" });
        }
        return res.status(200).json({ valid: true, type: "supabase" });
      }
    }

    const [timestampStr, hash] = token.split(".");
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ valid: false, error: "Token expired" });
    }

    const rawToken1 = `${ADMIN_EMAIL.toLowerCase()}:${timestamp}:${SECRET_SALT}`;
    const rawToken2 = `admin:${timestamp}:${SECRET_SALT}`;
    const rawToken3 = `admin@floatingdrapes.com:${timestamp}:${SECRET_SALT}`;
    const expected1 = crypto.createHash("sha256").update(rawToken1).digest("hex");
    const expected2 = crypto.createHash("sha256").update(rawToken2).digest("hex");
    const expected3 = crypto.createHash("sha256").update(rawToken3).digest("hex");

    if (hash === expected1 || hash === expected2 || hash === expected3) {
      return res.status(200).json({ valid: true, type: "env" });
    }

    return res.status(401).json({ valid: false });
  } catch (err) {
    return res.status(500).json({ valid: false });
  }
}

export default function handler(req: any, res: any) {
  return handleAdminVerify(req, res);
}
