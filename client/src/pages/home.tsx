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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-black py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <img 
              src="/attached_assets/1.png" 
              alt="Barby & Ken Logo" 
              className="h-40 mb-12"
            />
            <p className="text-2xl text-white mb-12 text-center max-w-2xl font-light">
              The best BBQs in Malta, no hassle, just great food and Barby Vibes
            </p>
            <Link href="/booking">
              <Button size="lg" className="bg-[hsl(35,100%,50%)] hover:bg-[hsl(35,100%,45%)] text-black font-semibold px-8 py-6 text-lg">
                Book Your BBQ Experience
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="bg-neutral-50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Locations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations?.map((location) => (
              <Card key={location.id} className="overflow-hidden transition-all hover:shadow-lg">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="w-full h-56 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{location.name}</h3>
                  <p className="text-gray-600">{location.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-black text-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-[hsl(35,100%,50%)] text-5xl font-bold mb-4">1</div>
              <h3 className="text-2xl font-semibold mb-4">Choose Location</h3>
              <p className="text-gray-300">Select from our beautiful beach locations across Malta</p>
            </div>
            <div className="text-center">
              <div className="text-[hsl(35,100%,50%)] text-5xl font-bold mb-4">2</div>
              <h3 className="text-2xl font-semibold mb-4">Pick Package</h3>
              <p className="text-gray-300">Choose from our range of BBQ and food packages</p>
            </div>
            <div className="text-center">
              <div className="text-[hsl(35,100%,50%)] text-5xl font-bold mb-4">3</div>
              <h3 className="text-2xl font-semibold mb-4">Enjoy</h3>
              <p className="text-gray-300">We handle setup and cleanup - just enjoy your BBQ!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}