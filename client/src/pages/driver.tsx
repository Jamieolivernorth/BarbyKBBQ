import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Booking, LOCATIONS, PACKAGES } from "@shared/schema";
import { format } from "date-fns";
import { LogOut, Truck } from "lucide-react";
import { useLocation } from "wouter";

const deliveryStatusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  collected: "bg-gray-100 text-gray-800"
};

const deliveryStatusLabels = {
  scheduled: "Scheduled",
  in_transit: "In Transit",
  delivered: "Delivered",
  collected: "Collected"
};

export default function DriverDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery<Booking[]>({
    queryKey: ["/api/driver/deliveries"],
    refetchInterval: 30000,
  });

  const { data: pickups, isLoading: pickupsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/driver/pickups"],
    refetchInterval: 30000,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Booking> }) => {
      const response = await apiRequest("PATCH", `/api/admin/bookings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/pickups"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    // Clear any driver session data
    localStorage.removeItem('driverAccess');
    setLocation("/driver-login");
  };

  const getLocationName = (locationId: number) => {
    return LOCATIONS.find(l => l.id === locationId)?.name || "Unknown Location";
  };

  const getPackageName = (packageId: number) => {
    return PACKAGES.find(p => p.id === packageId)?.name || "Unknown Package";
  };

  const handleStatusChange = (booking: Booking, newStatus: string) => {
    const updateData: Partial<Booking> = {
      deliveryStatus: newStatus as any,
    };

    if (newStatus === "in_transit") {
      updateData.actualStartTime = new Date();
    } else if (newStatus === "delivered") {
      updateData.actualEndTime = new Date();
    }

    updateBookingMutation.mutate({
      id: booking.id,
      data: updateData
    });
  };

  const BookingCard = ({ booking, type }: { booking: Booking; type: 'delivery' | 'pickup' }) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">#{booking.id}</span>
              <Badge className={deliveryStatusColors[booking.deliveryStatus as keyof typeof deliveryStatusColors]}>
                {deliveryStatusLabels[booking.deliveryStatus as keyof typeof deliveryStatusLabels]}
              </Badge>
            </CardTitle>
            <CardDescription>
              {booking.customerName} • {booking.customerPhone}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{format(new Date(booking.date), "MMM dd, yyyy")}</p>
            <p>{booking.timeSlot}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Location</p>
              <p className="text-gray-600">{getLocationName(booking.locationId)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Package</p>
              <p className="text-gray-600">{getPackageName(booking.packageId)}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {type === 'delivery' && (
              <>
                {booking.deliveryStatus === "scheduled" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(booking, "in_transit")}
                    disabled={updateBookingMutation.isPending}
                    className="bg-[#C8913B] hover:bg-[#b17d33]"
                  >
                    Start Delivery
                  </Button>
                )}
                {booking.deliveryStatus === "in_transit" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(booking, "delivered")}
                    disabled={updateBookingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Delivered
                  </Button>
                )}
              </>
            )}
            
            {type === 'pickup' && booking.deliveryStatus === "delivered" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange(booking, "collected")}
                disabled={updateBookingMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Mark Collected
              </Button>
            )}
          </div>

          {booking.actualStartTime && (
            <div className="text-xs text-gray-500 mt-2">
              Started: {format(new Date(booking.actualStartTime), "HH:mm")}
              {booking.actualEndTime && (
                <span> • Completed: {format(new Date(booking.actualEndTime), "HH:mm")}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Driver Header */}
      <div className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-[#C8913B]" />
              <div>
                <h1 className="text-xl font-bold">Driver Dashboard</h1>
                <p className="text-sm text-gray-300">Barby & Ken Delivery Portal</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-black border-gray-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="deliveries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              Deliveries
              {deliveries && deliveries.length > 0 && (
                <Badge variant="secondary">{deliveries.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pickups" className="flex items-center gap-2">
              Pickups
              {pickups && pickups.length > 0 && (
                <Badge variant="secondary">{pickups.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4">
            {deliveriesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="grid gap-4">
                {deliveries.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="delivery" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No deliveries scheduled</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pickups" className="space-y-4">
            {pickupsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : pickups && pickups.length > 0 ? (
              <div className="grid gap-4">
                {pickups.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="pickup" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No pickups scheduled</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="border-[#C8913B] bg-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Truck className="h-5 w-5 text-[#C8913B]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#8B4513]">
                  Real-time Updates
                </h3>
                <div className="mt-2 text-sm text-[#8B4513]">
                  <p>This dashboard automatically refreshes every 30 seconds. Update delivery status as you progress through each booking. Contact support if you encounter any issues.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}