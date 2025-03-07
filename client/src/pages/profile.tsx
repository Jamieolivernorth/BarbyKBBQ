import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@shared/schema";

export default function Profile() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/users/1/bookings"], // TODO: Get user ID from auth context
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <div className="grid gap-6">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>Booking #{booking.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p>Time Slot: {booking.timeSlot}</p>
                  <p>Status: {booking.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
