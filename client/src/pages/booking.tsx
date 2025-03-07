import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Location, Package } from "@shared/schema";
import { LocationSelector } from "@/components/location-selector";
import { PackageCard } from "@/components/package-card";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Booking() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();

  const { toast } = useToast();

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your BBQ experience has been booked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (locationsLoading || packagesLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = () => {
    if (!selectedLocation || !selectedPackage || !selectedDate || !selectedSlot) {
      toast({
        title: "Incomplete Booking",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      locationId: selectedLocation,
      packageId: selectedPackage,
      date: selectedDate,
      timeSlot: selectedSlot,
      userId: 1, // TODO: Get from auth context
    });
  };

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Book Your BBQ Experience</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Choose Location</h2>
            <LocationSelector
              locations={locations || []}
              selectedId={selectedLocation}
              onSelect={setSelectedLocation}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Select Package</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  selected={selectedPackage === pkg.id}
                  onSelect={() => setSelectedPackage(pkg.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Pick Date & Time</h2>
            <div className="max-w-md">
              <TimeSlotPicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSelectDate={setSelectedDate}
                onSelectSlot={setSelectedSlot}
              />
            </div>
          </section>

          <div className="text-center">
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              size="lg"
              onClick={handleSubmit}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
