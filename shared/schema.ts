import { pgTable, text, serial, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Update the constants at the top
export const TIME_SLOTS = [
  "09:00-12:00",  // Morning slot (includes 1hr delivery)
  "13:00-16:00",  // Afternoon slot (includes 1hr delivery)
  "17:00-20:00",  // Evening slot (includes 1hr delivery)
  "21:00-00:00"   // Night slot (includes 1hr delivery)
] as const;

export const MAX_BBQS = 5; // We now have 5 BBQs available

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

// Add balance field to users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  balance: decimal("balance").notNull().default("0"),
});

// Add assets table at the top with other tables
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Add affiliate links table
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  customUrl: text("custom_url").notNull().unique(),
  commissionRate: decimal("commission_rate").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalCommission: decimal("total_commission").notNull().default("0"),
});

// Add commission transactions table
export const commissionTransactions = pgTable("commission_transactions", {
  id: serial("id").primaryKey(),
  affiliateLinkId: integer("affiliate_link_id").notNull(),
  bookingId: integer("booking_id").notNull(),
  amount: decimal("amount").notNull(),
  status: text("status").notNull().default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// Update the BookingStatus type and validation
export const BOOKING_STATUS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export const PAYMENT_STATUS = [
  "unpaid",
  "paid",
  "refunded"
] as const;

export const DELIVERY_STATUS = [
  "scheduled",
  "in_transit",
  "delivered",
  "collected"
] as const;

export type BookingStatus = typeof BOOKING_STATUS[number];
export type PaymentStatus = typeof PAYMENT_STATUS[number];
export type DeliveryStatus = typeof DELIVERY_STATUS[number];

export const bookingStatusSchema = z.enum(BOOKING_STATUS);
export const paymentStatusSchema = z.enum(PAYMENT_STATUS);
export const deliveryStatusSchema = z.enum(DELIVERY_STATUS);

// Update booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  packageId: integer("package_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  deliveryStatus: text("delivery_status").notNull().default("scheduled"),
  bbqCount: integer("bbq_count").notNull().default(1),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  affiliateLinkId: integer("affiliate_link_id"),
  commissionPaid: boolean("commission_paid").notNull().default(false),
  cleanupContribution: boolean("cleanup_contribution").notNull().default(false),
  cleanupAmount: decimal("cleanup_amount").default("5.00"),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  isAdmin: z.boolean().optional(),
});

// Update the booking types
export const insertBookingSchema = createInsertSchema(bookings).extend({
  timeSlot: z.enum(TIME_SLOTS),
  date: z.coerce.date(),
  status: bookingStatusSchema.default("pending"),
  paymentStatus: paymentStatusSchema.default("unpaid"),
  deliveryStatus: deliveryStatusSchema.default("scheduled"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(8, "Phone number must be at least 8 characters"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Location = typeof locations.$inferSelect;
export type Package = typeof packages.$inferSelect;

// Add types for the new schemas
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

export type CommissionTransaction = typeof commissionTransactions.$inferSelect;
export type InsertCommissionTransaction = typeof commissionTransactions.$inferInsert;

// Add types after other type definitions
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferSelect;

// Add validation schemas
export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks, {
  customUrl: z.string().min(3, "Custom URL must be at least 3 characters"),
  commissionRate: z.number().min(0).max(100, "Commission rate must be between 0 and 100"),
});

// Update the SlotAvailability type
export type SlotAvailability = {
  date: Date;
  timeSlot: string;
  availableBBQs: number;
  isCleaningTime?: boolean;
  nextAvailableSlot?: string; // Add next available slot info
};

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
    imageUrl: "https://lh5.googleusercontent.com/p/AF1QipNXjHC6v0Jt_SpqwGWqKfH322KqTQiVzKMx1mii=s1600"
  },
  {
    id: 6,
    name: "Sliema & Exiles Beach",
    description: "Urban beach perfect for evening BBQs",
    imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/255632301.jpg?k=57a880758b35004100f305caf91ed60f4193cb3bec3c61ac533ce861d48fbcbc&o=&hp=1"
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

// Add default assets to the constants section
export const DEFAULT_ASSETS = [
  {
    id: 1,
    name: "Barby & Ken Logo White",
    path: "/assets/1.png",
    type: "image/png",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Barby & Ken Logo Black",
    path: "/assets/2.png",
    type: "image/png",
    createdAt: new Date(),
  }
] as const;