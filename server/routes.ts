import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/locations", async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get("/api/packages", async (req, res) => {
    const packages = await storage.getPackages();
    res.json(packages);
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid user data" });
      return;
    }
    
    const user = await storage.createUser(result.data);
    res.json(user);
  });

  app.post("/api/bookings", async (req, res) => {
    const result = insertBookingSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid booking data" });
      return;
    }

    const booking = await storage.createBooking(result.data);
    res.json(booking);
  });

  app.get("/api/users/:userId/bookings", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const bookings = await storage.getUserBookings(userId);
    res.json(bookings);
  });

  return httpServer;
}
