import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { config, logWithEnv } from "./config";

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  logWithEnv("Server started in development environment");

  const server = await registerRoutes(app);

  // Always use Vite development server setup
  await setupVite(app, server);

  const PORT = config.port;
  server.listen(PORT, "0.0.0.0", () => {
    logWithEnv(`serving on port ${PORT}`);
  });
}

startServer().catch(console.error);