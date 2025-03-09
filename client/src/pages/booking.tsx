import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Location, Package } from "@shared/schema";
import { LocationSelector } from "@/components/location-selector";
import { PackageCard } from "@/components/package-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Booking() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  if (locationsLoading || packagesLoading) {
    return <div>Loading...</div>;
  }

  const handleBooking = () => {
    if (!selectedLocation || !selectedPackage) {
      toast({
        title: "Incomplete Selection",
        description: "Please select both a location and a package",
        variant: "destructive",
      });
      return;
    }

    const selectedLocationData = locations?.find(loc => loc.id === selectedLocation);
    const selectedPackageData = packages?.find(pkg => pkg.id === selectedPackage);

    //Handle potential null or undefined values
    if (!selectedLocationData || !selectedPackageData) {
        toast({
          title: "Error",
          description: "Could not find selected location or package.",
          variant: "destructive",
        });
        return;
    }

    const message = `Hi! I'd like to book a BBQ at ${selectedLocationData?.name} with the ${selectedPackageData?.name} package. Please help me arrange a suitable time.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+35679000000?text=${encodedMessage}`; // Replace with your actual WhatsApp business number

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
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

          <div className="text-center">
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              size="lg"
              onClick={handleBooking}
            >
              Book via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}