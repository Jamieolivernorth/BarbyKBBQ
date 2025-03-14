import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Booking, BOOKING_STATUS, PAYMENT_STATUS, DELIVERY_STATUS, Location, Package } from "@shared/schema";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: packages } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: number; data: Partial<Booking> }) => {
      const response = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking Updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startBookingTimer = async (bookingId: number) => {
    try {
      const now = new Date();
      await updateBookingMutation.mutateAsync({
        bookingId,
        data: {
          actualStartTime: now,
          actualEndTime: new Date(now.getTime() + (3 * 60 * 60 * 1000)), // 3 hours from now
          deliveryStatus: "delivered",
          status: "confirmed"
        }
      });
    } catch (error) {
      console.error("Failed to start booking timer:", error);
    }
  };

  const getLocationName = (locationId: number) => {
    return locations?.find(loc => loc.id === locationId)?.name || 'Unknown Location';
  };

  const getPackageName = (packageId: number) => {
    return packages?.find(pkg => pkg.id === packageId)?.name || 'Unknown Package';
  };

  const getTimeRemaining = (booking: Booking) => {
    if (!booking.actualStartTime || !booking.actualEndTime) return null;

    const now = new Date();
    const end = new Date(booking.actualEndTime);
    const remaining = end.getTime() - now.getTime();

    if (remaining <= 0) return "Completed";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationName(booking.locationId).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (bookingsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Admin Header */}
      <div className="bg-black text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <Link href="/admin">
            <Button variant="outline" className="text-white border-white hover:bg-gray-800">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <div className="flex gap-4 mb-6 mt-6">
              <Input
                placeholder="Search by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {BOOKING_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Timer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.customerPhone}</TableCell>
                    <TableCell>{getLocationName(booking.locationId)}</TableCell>
                    <TableCell>{getPackageName(booking.packageId)}</TableCell>
                    <TableCell>
                      {format(new Date(booking.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{booking.timeSlot}</TableCell>
                    <TableCell>
                      <Select
                        value={booking.paymentStatus}
                        onValueChange={(value) => {
                          updateBookingMutation.mutate({
                            bookingId: booking.id,
                            data: { paymentStatus: value }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.deliveryStatus}
                        onValueChange={(value) => {
                          updateBookingMutation.mutate({
                            bookingId: booking.id,
                            data: { deliveryStatus: value }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {booking.actualStartTime ? (
                        <span className="text-sm">
                          {getTimeRemaining(booking)}
                        </span>
                      ) : (
                        booking.paymentStatus === "paid" && (
                          <Button
                            size="sm"
                            onClick={() => startBookingTimer(booking.id)}
                          >
                            Start Timer
                          </Button>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => {
                          updateBookingMutation.mutate({
                            bookingId: booking.id,
                            data: { status: value }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOKING_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Booking</DialogTitle>
                          </DialogHeader>
                          {/* Add edit form here in next iteration */}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}