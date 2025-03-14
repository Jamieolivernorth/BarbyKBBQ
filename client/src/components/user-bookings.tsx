import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatus } from "@/components/booking-status";
import { Booking } from "@shared/schema";

export function UserBookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/user/bookings"],
  });

  if (isLoading) {
    return <div>Loading your bookings...</div>;
  }

  if (!bookings?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No bookings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Bookings</h2>
      {bookings.map((booking) => (
        <Card key={booking.id} className="mb-4">
          <CardHeader>
            <CardTitle>
              Booking for {new Date(booking.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p>Time Slot: {booking.timeSlot}</p>
              <p>Status: {booking.status}</p>
              <p>Payment: {booking.paymentStatus}</p>
            </div>
            <BookingStatus booking={booking} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
