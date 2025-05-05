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
              
              {booking.cleanupContribution && (
                <div className="mt-2 px-3 py-2 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Beach Cleanup Contribution: €{booking.cleanupAmount}
                  </p>
                </div>
              )}
            </div>
            <BookingStatus booking={booking} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
