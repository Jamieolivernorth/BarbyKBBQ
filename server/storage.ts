import { 
  User, InsertUser, Booking, InsertBooking,
  LOCATIONS, PACKAGES, SlotAvailability, TIME_SLOTS, MAX_BBQS
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getLocations(): Promise<typeof LOCATIONS>;
  getPackages(): Promise<typeof PACKAGES>;
  getAvailability(date: Date): Promise<SlotAvailability[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { ...insertBooking, id };
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
    return TIME_SLOTS.map(timeSlot => {
      const bookedBBQs = dayBookings
        .filter(booking => booking.timeSlot === timeSlot)
        .reduce((total, booking) => total + (booking.bbqCount || 1), 0);

      return {
        date: date,
        timeSlot,
        availableBBQs: MAX_BBQS - bookedBBQs
      };
    });
  }
}

export const storage = new MemStorage();