import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertAffiliateLinkSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import fetch from 'node-fetch';
import path from "path";
import fs from "fs";
import aiShoppingRoutes from "./api/ai-shopping";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  
  // Register AI shopping routes
  app.use('/api/ai-shopping', aiShoppingRoutes);

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
        if (user.password !== password) {
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

  app.post("/api/bookings", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const booking = {
        ...req.body,
        userId: (req.user as any).id,
      };

      console.log("Received booking data:", booking);

      const result = insertBookingSchema.safeParse(booking);
      if (!result.success) {
        console.log("Validation error:", result.error);
        res.status(400).json({ error: "Invalid booking data", details: result.error });
        return;
      }

      const newBooking = await storage.createBooking(result.data);
      console.log("Created booking:", newBooking);
      res.json(newBooking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({ error: "Failed to create booking" });
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

      // For testing purposes, make the first user an admin
      const userCount = await storage.getUserCount();
      const isFirstUser = userCount === 0;

      const user = await storage.createUser({
        ...result.data,
        isAdmin: isFirstUser, // Make first user admin
      });

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

  // Add weather route
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const location = req.params.location;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},mt&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  // Add new admin routes for booking management
  app.get("/api/admin/bookings", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Check for admin role
    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Update the PATCH endpoint for admin bookings
  app.patch("/api/admin/bookings/:id", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Check for admin role
    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const {
      status,
      paymentStatus,
      deliveryStatus,
      customerName,
      customerPhone,
      timeSlot,
      date,
      actualStartTime,
      actualEndTime
    } = req.body;

    try {
      const booking = await storage.updateBooking(parseInt(id), {
        status,
        paymentStatus,
        deliveryStatus,
        customerName,
        customerPhone,
        timeSlot,
        date: date ? new Date(date) : undefined,
        actualStartTime: actualStartTime ? new Date(actualStartTime) : undefined,
        actualEndTime: actualEndTime ? new Date(actualEndTime) : undefined
      });

      // Notify clients about availability change if status affects availability
      if (status === "cancelled" || status === "completed") {
        //This function is removed in this edit
        //await notifyAvailabilityChange();
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Only super admin (first user) can make others admin
    const adminUser = await storage.getUser((req.user as any).id);
    if (!adminUser?.isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const { isAdmin } = req.body;

    try {
      const updatedUser = await storage.updateUser(parseInt(id), { isAdmin });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Add assets route with logging
  app.get("/assets/:filename", async (req, res) => {
    try {
      const assetPath = `/assets/${req.params.filename}`;
      console.log("Requested asset path:", assetPath);

      const asset = await storage.getAssetByPath(assetPath);
      console.log("Found asset in storage:", asset);

      // Serve from attached_assets folder
      const filePath = path.join(process.cwd(), "attached_assets", req.params.filename);
      console.log("Looking for file at:", filePath);

      if (!fs.existsSync(filePath)) {
        console.log("File not found at path:", filePath);
        res.status(404).json({ error: "Asset file not found" });
        return;
      }

      console.log("Serving file from:", filePath);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving asset:", error);
      res.status(500).json({ error: "Failed to serve asset" });
    }
  });


  // Add affiliate management routes
  app.get("/api/admin/affiliate-links", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const links = await storage.getAllAffiliateLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch affiliate links" });
    }
  });

  app.post("/api/admin/affiliate-links", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const result = insertAffiliateLinkSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: "Invalid affiliate link data" });
        return;
      }

      const link = await storage.createAffiliateLink({
        ...result.data,
        userId: (req.user as any).id,
      });
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to create affiliate link" });
    }
  });

  // Update the user balance display route
  app.get("/api/user/balance", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const user = await storage.getUser((req.user as any).id);
      res.json({ balance: user?.balance || 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user balance" });
    }
  });

  // BBQ Equipment management routes
  app.get("/api/admin/bbq-equipment", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const equipment = await storage.getAllBBQEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch BBQ equipment" });
    }
  });

  app.get("/api/admin/bbq-equipment/:id", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const equipment = await storage.getBBQEquipment(Number(req.params.id));
      if (!equipment) {
        return res.status(404).json({ error: "BBQ equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch BBQ equipment" });
    }
  });

  app.patch("/api/admin/bbq-equipment/:id", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const equipment = await storage.updateBBQEquipment(Number(req.params.id), req.body);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update BBQ equipment" });
    }
  });

  app.post("/api/admin/bbq-equipment/:id/assign", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const { bookingId } = req.body;
      const equipment = await storage.assignBBQToBooking(Number(req.params.id), bookingId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign BBQ equipment" });
    }
  });

  app.post("/api/admin/bbq-equipment/:id/release", async (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req.user as any).isAdmin) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    try {
      const equipment = await storage.releaseBBQFromBooking(Number(req.params.id));
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to release BBQ equipment" });
    }
  });

  // Driver authentication
  app.post("/api/driver/login", async (req, res) => {
    const { driverCode } = req.body;
    
    // Simple driver code validation (in production, this should be more secure)
    const validDriverCodes = ["DRIVER001", "DRIVER002", "DELIVERY001", "BARBYKEN2025"];
    
    if (!driverCode || !validDriverCodes.includes(driverCode)) {
      res.status(401).json({ error: "Invalid driver code" });
      return;
    }

    // Create a driver session (simplified)
    req.session.driverAccess = true;
    req.session.driverCode = driverCode;
    
    res.json({ success: true, message: "Driver access granted" });
  });

  // Driver/Delivery routes for real-time booking system
  app.get("/api/driver/deliveries", async (req, res) => {
    // Check for either user authentication or driver access
    if (!req.user && !req.session.driverAccess) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const bookings = await storage.getAllBookings();
      const deliveryBookings = bookings.filter(booking => 
        booking.status === "confirmed" && 
        (booking.deliveryStatus === "scheduled" || booking.deliveryStatus === "in_transit")
      );
      res.json(deliveryBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery bookings" });
    }
  });

  app.get("/api/driver/pickups", async (req, res) => {
    // Check for either user authentication or driver access
    if (!req.user && !req.session.driverAccess) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const bookings = await storage.getAllBookings();
      const pickupBookings = bookings.filter(booking => 
        booking.deliveryStatus === "delivered"
      );
      res.json(pickupBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pickup bookings" });
    }
  });

  return httpServer;
}