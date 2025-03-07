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
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
            Barby and Ken
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            The best BBQs in Malta, no hassle, just great food and Barby Vibes
          </p>
          <Link href="/booking">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Book Your BBQ Experience
            </Button>
          </Link>
        </div>

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
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
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
