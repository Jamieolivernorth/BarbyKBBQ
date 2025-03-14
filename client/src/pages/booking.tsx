import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Location, Package, User } from "@shared/schema";
import { LocationSelector } from "@/components/location-selector";
import { PackageCard } from "@/components/package-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AvailabilityDisplay } from "@/components/availability-display";
import { ShareBooking } from "@/components/share-booking";
import { BookingStatus } from "@/components/booking-status";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

const fadeInOut = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function Booking() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isBooked, setIsBooked] = useState(false);
  const { toast } = useToast();

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (locationsLoading || packagesLoading) {
    return <div>Loading...</div>;
  }

  const handleBooking = async () => {
    if (!selectedLocation || !selectedPackage || !selectedDate || !user) {
      toast({
        title: "Incomplete Selection",
        description: "Please ensure you're logged in and all selections are made",
        variant: "destructive",
      });
      return;
    }

    const selectedLocationData = locations?.find(loc => loc.id === selectedLocation);
    const selectedPackageData = packages?.find(pkg => pkg.id === selectedPackage);

    if (!selectedLocationData || !selectedPackageData) {
      toast({
        title: "Error",
        description: "Could not find selected location or package.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating booking with data:", {
        locationId: selectedLocation,
        packageId: selectedPackage,
        date: selectedDate,
        customerName: user.username,
        customerPhone: user.phone,
        timeSlot: "09:00-12:00",
        status: "pending",
        paymentStatus: "unpaid"
      });

      const response = await apiRequest("POST", "/api/bookings", {
        locationId: selectedLocation,
        packageId: selectedPackage,
        date: selectedDate,
        customerName: user.username,
        customerPhone: user.phone,
        timeSlot: "09:00-12:00", 
        status: "pending",
        paymentStatus: "unpaid"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await response.json();

      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const message = `Hi! I'd like to book a BBQ at ${selectedLocationData.name} with the ${selectedPackageData.name} package for ${formattedDate}. Please help me arrange a suitable time.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/+35679000000?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
      setIsBooked(true);

      toast({
        title: "Booking Created",
        description: "Your booking is pending confirmation. Please complete the WhatsApp conversation to confirm details.",
      });

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      {user?.isAdmin && (
        <div className="bg-orange-600 text-white py-2 px-4 mb-4">
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-semibold">Admin Access</span>
            <Link href="/admin">
              <Button variant="outline" className="text-white border-white hover:bg-orange-700">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Book Your BBQ Experience
        </motion.h1>

        <div className="space-y-12">
          <AnimatePresence mode="wait">
            {!isBooked ? (
              <>
                <motion.section {...fadeInOut} key="location-section">
                  <h2 className="text-2xl font-semibold mb-4">Choose Location</h2>
                  <LocationSelector
                    locations={locations || []}
                    selectedId={selectedLocation}
                    onSelect={setSelectedLocation}
                  />
                </motion.section>

                {selectedLocation && (
                  <motion.section {...fadeInOut} key="package-section">
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
                  </motion.section>
                )}

                {selectedPackage && (
                  <motion.section {...fadeInOut} key="date-section">
                    <h2 className="text-2xl font-semibold mb-4">Choose Preferred Date</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="pt-6">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            className="rounded-md border"
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-4">Real-time Availability</h3>
                          <AvailabilityDisplay selectedDate={selectedDate} />
                        </CardContent>
                      </Card>
                    </div>
                  </motion.section>
                )}
              </>
            ) : (
              <motion.div
                key="booking-confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Initiated!</h2>
                      <p className="text-gray-600 mb-6">Share your BBQ plans with friends and family!</p>
                    </div>
                    <ShareBooking
                      location={locations?.find(loc => loc.id === selectedLocation)?.name || ''}
                      date={selectedDate?.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) || ''}
                      package={packages?.find(pkg => pkg.id === selectedPackage)?.name || ''}
                    />
                    <BookingStatus
                      booking={{
                        id: booking?.id,
                        locationId: selectedLocation,
                        packageId: selectedPackage,
                        date: selectedDate,
                        customerName: user?.username || '',
                        customerPhone: user?.phone || '',
                        timeSlot: "09:00-12:00",
                        status: "pending",
                        paymentStatus: "unpaid",
                        actualStartTime: null,
                        actualEndTime: null
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedLocation && selectedPackage && selectedDate && !isBooked && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                size="lg"
                onClick={handleBooking}
              >
                Book via WhatsApp
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}