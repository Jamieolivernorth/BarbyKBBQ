import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { UserBookings } from "@/components/user-bookings";
import { User } from "@shared/schema";

export default function Profile() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: balance } = useQuery({
    queryKey: ["/api/user/balance"],
  });

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Account Details</h2>
                  <p className="text-gray-600">Username: {user?.username}</p>
                  <p className="text-gray-600">Email: {user?.email}</p>
                  <p className="text-gray-600">Phone: {user?.phone}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Account Balance</h2>
                  <p className="text-2xl font-bold text-[#C8913B]">€{balance?.balance || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <UserBookings />
        </div>
      </div>
    </div>
  );
}