// Vercel API endpoint - handles all server routes
import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();

// Register all routes
registerRoutes(app);

export default app;