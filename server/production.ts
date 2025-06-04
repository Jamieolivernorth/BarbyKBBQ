import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, "public")));

// Handle client-side routing - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "API endpoint not found" });
    return;
  }
  
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[PRODUCTION] Server started in production environment`);
  console.log(`[express] serving on port ${PORT}`);
});