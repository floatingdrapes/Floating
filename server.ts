import express from "express";
import path from "path";
import dotenv from "dotenv";

import { handleAdminLogin } from "./api/admin/login";
import { handleAdminVerify } from "./api/admin/verify";
import { handleSendEmail } from "./api/send-email";
import { handleGetSupabaseConfig, handleSaveSupabaseConfig, getStoredSupabaseConfig } from "./api/supabase-config";
import { handleImportImageUrl } from "./api/import-image";

dotenv.config();

// Pre-load stored Supabase config into process.env on server boot
getStoredSupabaseConfig();

export function createExpressApp() {
  const app = express();

  // Disable technology footprint identifier
  app.disable("x-powered-by");

  // Global Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' ws: wss: https:; " +
      "frame-ancestors 'self' https: http:;"
    );

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    next();
  });

  // API No-Cache Security Middleware
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Explicit route for favicon.ico and site.webmanifest for search engines and browser address bars
  app.get("/favicon.ico", (req, res) => {
    res.setHeader("Content-Type", "image/x-icon");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.sendFile(path.join(process.cwd(), "public", "favicon.ico"));
  });

  app.get("/site.webmanifest", (req, res) => {
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.join(process.cwd(), "public", "site.webmanifest"));
  });

  // Explicit routes for AI models (Gemini, ChatGPT, Perplexity, Copilot) & Search Engine Bots
  app.get(["/llms.txt", "/llms-full.txt", "/.well-known/llms.txt"], (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.join(process.cwd(), "public", "llms.txt"));
  });

  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  // Use JSON & URLencoded middleware with generous 50mb limit for media/data payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Backend Admin Authentication API & Email Routes
  app.post("/api/admin/login", (req, res) => handleAdminLogin(req, res));
  app.post("/api/admin/verify", (req, res) => handleAdminVerify(req, res));
  app.post("/api/send-email", (req, res) => handleSendEmail(req, res));

  // Universal Supabase Database Config Endpoints
  app.get("/api/supabase-config", (req, res) => handleGetSupabaseConfig(req, res));
  app.post("/api/supabase-config", (req, res) => handleSaveSupabaseConfig(req, res));

  // Universal Google Drive & Image URL Import Endpoint
  app.post("/api/import-image", (req, res) => handleImportImageUrl(req, res));

  return app;
}

export const app = createExpressApp();

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully operating on http://0.0.0.0:${PORT}`);
  });
}

// Start standalone server unless executing under Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}
