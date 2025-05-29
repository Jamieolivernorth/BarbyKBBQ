import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@shared/schema";

export default function AdminDashboard() {
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  // Calculate booking statistics
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  
  // Calculate beach cleanup contribution statistics
  const cleanupBookings = bookings?.filter(b => b.cleanupContribution) || [];
  const totalCleanupContributions = cleanupBookings.length;
  const totalCleanupAmount = cleanupBookings.reduce((sum, booking) => {
    const amount = booking.cleanupAmount ? parseFloat(booking.cleanupAmount) : 0;
    return sum + amount;
  }, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Admin Header */}
      <div className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#C8913B]">{totalBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Pending Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{pendingBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Confirmed Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{confirmedBookings}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Beach Cleanup Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Beach Cleanup Contributions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Total Contributions</p>
                <p className="text-3xl font-bold text-green-700">{totalCleanupContributions}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-green-700">€{totalCleanupAmount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Contribution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {totalBookings > 0 
                  ? `${((totalCleanupContributions / totalBookings) * 100).toFixed(1)}%` 
                  : '0%'}
              </p>
              <p className="text-sm text-gray-500 mt-1">of all bookings include cleanup contribution</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/admin/bookings">
                <Button variant="default" className="w-full text-left bg-[#C8913B] hover:bg-[#b17d33]">
                  Manage Bookings
                </Button>
              </Link>

              <Link href="/admin/affiliate">
                <Button variant="default" className="w-full text-left bg-[#C8913B] hover:bg-[#b17d33]">
                  Manage Affiliate Links
                </Button>
              </Link>

              <Link href="/admin/feature-flags">
                <Button variant="default" className="w-full text-left bg-blue-600 hover:bg-blue-700">
                  Feature Flags
                </Button>
              </Link>

              <Link href="/admin/inventory">
                <Button variant="default" className="w-full text-left bg-purple-600 hover:bg-purple-700">
                  BBQ Inventory
                </Button>
              </Link>

              <Link href="/admin/driver">
                <Button variant="default" className="w-full text-left bg-orange-600 hover:bg-orange-700">
                  Driver Dashboard
                </Button>
              </Link>
              
              <Link href="/admin/bookings?cleanup=with-cleanup">
                <Button variant="default" className="w-full text-left bg-green-600 hover:bg-green-700">
                  View Cleanup Contributions
                </Button>
              </Link>

              <Link href="/booking">
                <Button variant="outline" className="w-full text-left">
                  Return to Booking Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}