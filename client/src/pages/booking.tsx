import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Location, Package, User, Booking as BookingType } from "@shared/schema";
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

export default function BookingPage() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isBooked, setIsBooked] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<BookingType | null>(null);
  const [cleanupContribution, setCleanupContribution] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const bookingData = {
        locationId: selectedLocation,
        packageId: selectedPackage,
        date: selectedDate.toISOString(),
        customerName: user.username,
        customerPhone: user.phone,
        timeSlot: "09:00-12:00",
        status: "pending",
        paymentStatus: "unpaid",
        deliveryStatus: "scheduled",
        cleanupContribution: cleanupContribution,
        cleanupAmount: "5.00" 
      };

      console.log("Sending booking request with data:", bookingData);

      const response = await apiRequest("POST", "/api/bookings", bookingData);
      const responseData = await response.json();

      if (!response.ok) {
        console.error("Booking error response:", responseData);
        throw new Error(responseData.error || "Failed to create booking");
      }

      console.log("Booking created successfully:", responseData);

      // Set states first before any other operations
      setCurrentBooking(responseData);
      setIsBooked(true);

      // Format date for WhatsApp message
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Show success toast
      toast({
        title: "Booking Created Successfully!",
        description: "Your booking has been created. WhatsApp will open shortly to finalize details.",
      });

      // Refresh the bookings list
      await queryClient.invalidateQueries({ queryKey: ["/api/user/bookings"] });

      // Prepare and open WhatsApp after a delay
      const message = `Hi! I'd like to book a BBQ at ${selectedLocationData.name} with the ${selectedPackageData.name} package for ${formattedDate}. Please help me arrange a suitable time.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/+35679000000?text=${encodedMessage}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 2000);

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

                {selectedLocation && selectedPackage && selectedDate && !isBooked && (
                  <motion.section {...fadeInOut} key="cleanup-contribution-section">
                    <Card className="max-w-md mx-auto mb-6">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3 p-2">
                          <div className="flex items-center h-5 mt-1">
                            <input
                              type="checkbox"
                              checked={cleanupContribution}
                              onChange={(e) => setCleanupContribution(e.target.checked)}
                              className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">One-click Beach Cleanup Contribution</h3>
                            <p className="text-sm text-gray-500">
                              Add €5.00 to your booking to contribute to local beach cleanup efforts. 
                              100% of this amount goes directly to community-led initiatives that keep Malta's 
                              beaches clean and safe for everyone.
                            </p>
                            {cleanupContribution && (
                              <div className="mt-2 p-2 bg-green-50 rounded-md">
                                <p className="text-sm text-green-700">
                                  Thank you for your contribution to keep our beaches clean! 🌊
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  
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
                <Card className="shadow-lg">
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                      <p className="text-gray-600 mb-6">
                        Your booking has been created successfully! WhatsApp will open shortly to finalize the details.
                      </p>
                    </div>
                    {currentBooking && (
                      <>
                        <ShareBooking
                          location={locations?.find(loc => loc.id === currentBooking.locationId)?.name || ''}
                          date={new Date(currentBooking.date).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          package={packages?.find(pkg => pkg.id === currentBooking.packageId)?.name || ''}
                        />
                        <BookingStatus booking={currentBooking} />
                      </>
                    )}
                    <div className="text-center mt-4">
                      <Link href="/profile">
                        <Button variant="outline" className="mr-2">
                          View My Bookings
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}