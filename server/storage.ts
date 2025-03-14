import { 
  User, InsertUser, Booking, InsertBooking,
  LOCATIONS, PACKAGES, SlotAvailability, TIME_SLOTS, MAX_BBQS, BookingStatus
} from "@shared/schema";

interface Asset {
  path: string;
  // Add other relevant asset properties here as needed.
  data: any;
}

const DEFAULT_ASSETS: Asset[] = [
  { 
    path: '/assets/1.png', 
    data: { 
      id: 1,
      name: "Barby & Ken Logo White",
      type: "image/png"
    }
  },
  { 
    path: '/assets/2.png', 
    data: {
      id: 2,
      name: "Barby & Ken Logo Black",
      type: "image/png"
    }
  }
];


interface InsertAffiliateLink {
  userId: number;
  link: string;
  description?: string;
}

interface AffiliateLink {
  id: number;
  userId: number;
  link: string;
  description?: string;
  totalClicks: number;
  totalCommission: string;
  createdAt: Date;
  isActive: boolean;
}

interface InsertCommissionTransaction {
  affiliateLinkId: number;
  bookingId: number;
  amount: string;
  userId: number;
}

interface CommissionTransaction {
  id: number;
  affiliateLinkId: number;
  bookingId: number;
  amount: string;
  userId: number;
  status: "pending" | "processed";
  createdAt: Date;
  processedAt?: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserCount(): Promise<number>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getLocations(): Promise<typeof LOCATIONS>;
  getPackages(): Promise<typeof PACKAGES>;
  getAvailability(date: Date): Promise<SlotAvailability[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(bookingId: number, status: BookingStatus): Promise<Booking>;
  getAssetByPath(path: string): Promise<Asset | undefined>;
  updateBooking(bookingId: number, data: Partial<Booking>): Promise<Booking>;
  updateUser(userId: number, data: Partial<User>): Promise<User>;

  // Affiliate methods
  createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  getAllAffiliateLinks(): Promise<AffiliateLink[]>;
  getAffiliateLink(id: number): Promise<AffiliateLink | undefined>;
  updateAffiliateLink(id: number, data: Partial<AffiliateLink>): Promise<AffiliateLink>;
  trackAffiliateLinkClick(id: number): Promise<void>;

  // Commission methods
  createCommissionTransaction(transaction: InsertCommissionTransaction): Promise<CommissionTransaction>;
  processCommissionTransaction(id: number): Promise<CommissionTransaction>;

  // Balance methods
  getUserBalance(userId: number): Promise<number>;
  updateUserBalance(userId: number, amount: number): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private assets: Map<string, Asset>;
  private currentUserId: number;
  private currentBookingId: number;
  private affiliateLinks: Map<number, AffiliateLink>;
  private commissionTransactions: Map<number, CommissionTransaction>;
  private currentAffiliateLinkId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.assets = new Map(DEFAULT_ASSETS.map(asset => [asset.path, asset]));
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.affiliateLinks = new Map();
    this.commissionTransactions = new Map();
    this.currentAffiliateLinkId = 1;
    this.currentTransactionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false
    };
    this.users.set(id, user);
    return user;
  }
  async getUserCount(): Promise<number> {
    return this.users.size;
  }
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      status: "pending",
      bbqCount: 1 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getLocations() {
    return LOCATIONS;
  }

  async getPackages() {
    return PACKAGES;
  }

  async getAvailability(date: Date): Promise<SlotAvailability[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all bookings for the given date
    const dayBookings = Array.from(this.bookings.values()).filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= dayStart && bookingDate <= dayEnd;
    });

    // Calculate availability for each time slot
    return TIME_SLOTS.map((timeSlot, index) => {
      const bookedBBQs = dayBookings
        .filter(booking => booking.timeSlot === timeSlot)
        .reduce((total, booking) => total + (booking.bbqCount || 1), 0);

      const availableBBQs = MAX_BBQS - bookedBBQs;
      let nextAvailableSlot: string | undefined;

      // If current slot is full, find the next available slot
      if (availableBBQs <= 0) {
        const nextSlots = TIME_SLOTS.slice(index + 1);
        nextAvailableSlot = nextSlots.find(slot => {
          const slotBookings = dayBookings
            .filter(booking => booking.timeSlot === slot)
            .reduce((total, booking) => total + (booking.bbqCount || 1), 0);
          return (MAX_BBQS - slotBookings) > 0;
        });

        // If no slots available today, we could check tomorrow (left as future enhancement)
      }

      return {
        date: date,
        timeSlot,
        availableBBQs,
        nextAvailableSlot,
        isCleaningTime: false // Reserved for future use
      };
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBookingStatus(bookingId: number, status: BookingStatus): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const updatedBooking = { ...booking, status };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  async getAssetByPath(path: string): Promise<Asset | undefined> {
    return this.assets.get(path);
  }
  async updateBooking(bookingId: number, data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const updatedBooking = { ...booking, ...data };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { ...user, ...data };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Implement affiliate methods
  async createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink> {
    const id = this.currentAffiliateLinkId++;
    const newLink: AffiliateLink = {
      ...link,
      id,
      totalClicks: 0,
      totalCommission: "0",
      createdAt: new Date(),
      isActive: true,
    };
    this.affiliateLinks.set(id, newLink);
    return newLink;
  }

  async getAllAffiliateLinks(): Promise<AffiliateLink[]> {
    return Array.from(this.affiliateLinks.values());
  }

  async getAffiliateLink(id: number): Promise<AffiliateLink | undefined> {
    return this.affiliateLinks.get(id);
  }

  async updateAffiliateLink(id: number, data: Partial<AffiliateLink>): Promise<AffiliateLink> {
    const link = this.affiliateLinks.get(id);
    if (!link) {
      throw new Error("Affiliate link not found");
    }
    const updatedLink = { ...link, ...data };
    this.affiliateLinks.set(id, updatedLink);
    return updatedLink;
  }

  async trackAffiliateLinkClick(id: number): Promise<void> {
    const link = await this.getAffiliateLink(id);
    if (link) {
      await this.updateAffiliateLink(id, {
        totalClicks: link.totalClicks + 1
      });
    }
  }

  // Implement commission methods
  async createCommissionTransaction(transaction: InsertCommissionTransaction): Promise<CommissionTransaction> {
    const id = this.currentTransactionId++;
    const newTransaction: CommissionTransaction = {
      ...transaction,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.commissionTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async processCommissionTransaction(id: number): Promise<CommissionTransaction> {
    const transaction = this.commissionTransactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    const updatedTransaction = {
      ...transaction,
      status: "processed",
      processedAt: new Date(),
    };
    this.commissionTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Update user balance methods
  async getUserBalance(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user ? Number(user.balance) : 0;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = {
      ...user,
      balance: (Number(user.balance) + amount).toString(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();