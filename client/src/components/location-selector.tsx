import { Location } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { WeatherWidget } from "./weather-widget";
import { motion } from "framer-motion";

interface LocationSelectorProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (locationId: number) => void;
}

export function LocationSelector({ 
  locations, 
  selectedId, 
  onSelect 
}: LocationSelectorProps) {
  return (
    <RadioGroup 
      value={selectedId?.toString()} 
      onValueChange={(value) => onSelect(parseInt(value))}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <motion.div 
            key={location.id} 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RadioGroupItem
              value={location.id.toString()}
              id={`location-${location.id}`}
              className="sr-only"
            />
            <Label
              htmlFor={`location-${location.id}`}
              className="cursor-pointer block"
            >
              <Card className={`overflow-hidden transition-all ${
                selectedId === location.id ? 'ring-2 ring-orange-500' : ''
              }`}>
                <motion.img
                  src={location.imageUrl}
                  alt={location.name}
                  className="w-full h-40 object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <CardContent className="p-4">
                  <motion.h3 
                    className="font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {location.name}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {location.description}
                  </motion.p>
                  <WeatherWidget location={location} />
                </CardContent>
              </Card>
            </Label>
          </motion.div>
        ))}
      </div>
    </RadioGroup>
  );
}