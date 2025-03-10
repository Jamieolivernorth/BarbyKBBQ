import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Constants for time slots
export const TIME_SLOTS = [
  "12:00-15:00",  // 12pm - 3pm
  "16:00-19:00",  // 4pm - 7pm (1hr cleaning window before)
  "20:00-23:00"   // 8pm - 11pm (1hr cleaning window before)
] as const;

export const MAX_BBQS = 1; // Currently only 1 BBQ available

// Database tables
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  isVegetarian: boolean("is_vegetarian").default(false),
  includesAlcohol: boolean("includes_alcohol").default(false),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

// Add BookingStatus type and validation
export const BOOKING_STATUS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export type BookingStatus = typeof BOOKING_STATUS[number];

export const bookingStatusSchema = z.enum(BOOKING_STATUS);

// Update booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  packageId: integer("package_id").notNull(),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  status: text("status").notNull().default("pending"),
  bbqCount: integer("bbq_count").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
});

// Update booking types
export const insertBookingSchema = createInsertSchema(bookings).extend({
  timeSlot: z.enum(TIME_SLOTS),
  date: z.coerce.date(),
  status: bookingStatusSchema.default("pending"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Location = typeof locations.$inferSelect;
export type Package = typeof packages.$inferSelect;

export const LOCATIONS = [
  {
    id: 1,
    name: "Golden Bay",
    description: "Beautiful sandy beach perfect for sunset BBQs",
    imageUrl: "https://media.istockphoto.com/id/479913374/photo/golden-bay-beach-on-malta.jpg?s=612x612&w=0&k=20&c=0cmOLQ5tmaQP2OFgxtxU-0W12HBMVPsOTDfJHuCM7K4="
  },
  {
    id: 2,
    name: "Għajn Tuffieħa",
    description: "Scenic red sand beach with crystal clear waters",
    imageUrl: "https://media.istockphoto.com/id/1473500985/photo/ghajn-tuffieha-beach-at-sunset-in-the-golden-bay-of-malta.jpg?s=612x612&w=0&k=20&c=IASmqh4iwpYNMJzgLonJsR7jwdFe-jhw5QJX6PfbEsE="
  },
  {
    id: 3,
    name: "Mellieħa Bay (Għadira)",
    description: "Malta's largest sandy beach, perfect for families",
    imageUrl: "https://gayguidemalta.com/wp-content/uploads/2018/05/Mellieha-Bay-Malta.jpg"
  },
  {
    id: 4,
    name: "Armier Bay & Little Armier",
    description: "Twin bays with shallow waters ideal for BBQ gatherings",
    imageUrl: "https://www.rentaboat.com.mt/media/2947/little_armier_bay_41.jpg?crop=0,0,0,0.15072842006855722&cropmode=percentage&width=2000&height=1125"
  },
  {
    id: 5,
    name: "White Tower Bay",
    description: "Secluded beach with historic watchtower backdrop",
    imageUrl: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5"
  },
  {
    id: 6,
    name: "Sliema & Exiles Beach",
    description: "Urban beach perfect for evening BBQs",
    imageUrl: "https://images.unsplash.com/photo-1490365728022-deae76380607"
  }
];

export const PACKAGES = [
  {
    id: 1,
    name: "BBQ Only",
    description: "Just the BBQ setup, bring your own food",
    price: 40,
    isVegetarian: false,
    includesAlcohol: false
  },
  {
    id: 2,
    name: "BBQ + Food Package",
    description: "4 Burgers, 4 Large Wings, 2 Steaks, 4 Sausages",
    price: 70,
    isVegetarian: false,
    includesAlcohol: false
  },
  {
    id: 3,
    name: "BBQ + Vegetarian Package",
    description: "2 Burgers, 2 Wings, 2 Steaks, 2 Sausages, 2 Portabella Mushrooms, 2 Stuffed Peppers",
    price: 70,
    isVegetarian: true,
    includesAlcohol: false
  },
  {
    id: 4,
    name: "BBQ + Food & Alcohol",
    description: "Standard food package plus selected alcohol beverages",
    price: 100,
    isVegetarian: false,
    includesAlcohol: true
  },
  {
    id: 5,
    name: "VIP Package",
    description: "Premium food selection with dedicated service",
    price: 190,
    isVegetarian: false,
    includesAlcohol: true
  }
];

// Helper type for availability
export type SlotAvailability = {
  date: Date;
  timeSlot: string;
  availableBBQs: number;
  isCleaningTime?: boolean;
};