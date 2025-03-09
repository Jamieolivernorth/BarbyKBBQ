import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Location } from "@shared/schema";

export default function Home() {
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section with Logo */}
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <img 
              src="/attached_assets/1.png" 
              alt="Barby & Ken Logo" 
              className="h-32 mb-8"
            />
            <p className="text-xl text-white mb-8 text-center max-w-2xl">
              The best BBQs in Malta, no hassle, just great food and Barby Vibes
            </p>
            <Link href="/booking">
              <Button className="bg-[hsl(35,100%,50%)] hover:bg-[hsl(35,100%,45%)] text-black">
                Book Your BBQ Experience
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Locations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations?.map((location) => (
            <Card key={location.id} className="overflow-hidden">
              <img
                src={location.imageUrl}
                alt={location.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                <p className="text-gray-600">{location.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Choose Location</h3>
              <p>Select from our beautiful beach locations across Malta</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Pick Package</h3>
              <p>Choose from our range of BBQ and food packages</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">3. Enjoy</h3>
              <p>We handle setup and cleanup - just enjoy your BBQ!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}