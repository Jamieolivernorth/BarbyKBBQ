import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Setup session middleware
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) { // In production, use proper password hashing
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.get("/api/locations", async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get("/api/packages", async (req, res) => {
    const packages = await storage.getPackages();
    res.json(packages);
  });

  app.post("/api/register", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid user data" });
      return;
    }

    try {
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      const user = await storage.createUser(result.data);
      req.login(user, (err) => {
        if (err) {
          res.status(500).json({ error: "Login failed" });
          return;
        }
        res.json(user);
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const booking = {
      ...req.body,
      userId: (req.user as any).id,
      date: new Date(req.body.date),
    };

    const result = insertBookingSchema.safeParse(booking);
    if (!result.success) {
      res.status(400).json({ error: "Invalid booking data", details: result.error });
      return;
    }

    const newBooking = await storage.createBooking(result.data);
    res.json(newBooking);
  });

  app.get("/api/user/bookings", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const bookings = await storage.getUserBookings((req.user as any).id);
    res.json(bookings);
  });

  app.get("/api/user", (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json(req.user);
  });

  app.get("/api/availability", async (req, res) => {
    const { date } = req.query;

    console.log("Availability request received with date:", date);

    if (!date) {
      console.log("No date parameter provided");
      res.status(400).json({ error: "Date parameter is required" });
      return;
    }

    try {
      // Parse the ISO date string
      const queryDate = new Date(date as string);
      console.log("Parsed date:", queryDate);

      if (isNaN(queryDate.getTime())) {
        console.log("Invalid date format:", date);
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      const availability = await storage.getAvailability(queryDate);
      console.log(`Availability for ${date}:`, availability);
      res.json(availability);
    } catch (error) {
      console.error("Error getting availability:", error);
      res.status(500).json({ error: "Failed to get availability" });
    }
  });

  return httpServer;
}