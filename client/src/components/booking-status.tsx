import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@shared/schema";

interface BookingStatusProps {
  booking: Booking;
}

export function BookingStatus({ booking }: BookingStatusProps) {
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const bookingDate = new Date(booking.date);

      // Set start and end times based on the booking date
      const startTime = new Date(bookingDate);
      startTime.setHours(9, 0, 0); // 09:00
      const endTime = new Date(bookingDate);
      endTime.setHours(12, 0, 0); // 12:00

      // 30 minutes in milliseconds
      const thirtyMinutes = 30 * 60 * 1000;

      if (booking.paymentStatus !== 'paid') {
        setStatusMessage("Awaiting Payment");
        return;
      }

      if (now < new Date(startTime.getTime() - thirtyMinutes)) {
        setStatusMessage("Preparing your order");
      } else if (now >= new Date(startTime.getTime() - thirtyMinutes) && now < startTime) {
        setStatusMessage("Ken is delivering your BBQ");
      } else if (now >= startTime && now < new Date(endTime.getTime() - thirtyMinutes)) {
        setStatusMessage("Enjoy your Barbie Mate! 🍖");
      } else if (now >= new Date(endTime.getTime() - thirtyMinutes) && now < endTime) {
        setStatusMessage("Ken is on his way to clean up");
      } else {
        setStatusMessage("Booking Completed");
      }
    };

    // Update status immediately and then every minute
    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [booking]);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Booking Status</h3>
          <p className="text-lg text-[#C8913B]">{statusMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}