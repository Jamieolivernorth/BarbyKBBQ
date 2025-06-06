import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { config, logWithEnv } from "./config";
import { resolve } from 'node:path';
import type { Server } from 'node:http';

async function startServer() {
  const app = express();
  let server: Server

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // for production, serve static assets
  if (config.isProduction) {
    // Serve static files from dist/public
    app.use(express.static(resolve(import.meta.dirname, "public")));

    // Handle client-side routing - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      res.sendFile(resolve(import.meta.dirname, "public", "index.html"));
    });

    return app.listen(config.port, "0.0.0.0", () => {
      logWithEnv(`server started on port ${config.port}`);
    });
  }

  server = await registerRoutes(app);

  // default to use vite development server setup
  await setupVite(app, server);

  server.listen(config.port, "0.0.0.0", () => {
    logWithEnv(`server started on port ${config.port}`);
  });
}

startServer().catch(console.error);