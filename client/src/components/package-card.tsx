import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "@shared/schema";

interface PackageCardProps {
  package: Package;
  selected: boolean;
  onSelect: () => void;
}

export function PackageCard({ package: pkg, selected, onSelect }: PackageCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected ? 'ring-2 ring-orange-500 shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle>{pkg.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{pkg.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">€{pkg.price}</span>
          {pkg.isVegetarian && (
            <span className="text-green-600 text-sm">Vegetarian</span>
          )}
          {pkg.includesAlcohol && (
            <span className="text-purple-600 text-sm">Includes Alcohol</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
