import { SlotAvailability } from '@shared/schema';
import { useAvailability } from '@/hooks/use-availability';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AvailabilityDisplayProps {
  selectedDate?: Date;
}

export function AvailabilityDisplay({ selectedDate }: AvailabilityDisplayProps) {
  const { availability, isConnected } = useAvailability();

  const relevantSlots = availability.filter(slot => 
    selectedDate && 
    new Date(slot.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge variant={isConnected ? "success" : "destructive"}>
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </div>

      {selectedDate && (
        <div className="grid gap-4">
          {relevantSlots.map((slot) => (
            <Card key={slot.timeSlot}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{slot.timeSlot}</p>
                    <p className="text-sm text-gray-500">
                      {slot.isCleaningTime ? "Cleaning Time" : `${slot.availableBBQs} BBQ${slot.availableBBQs !== 1 ? 's' : ''} Available`}
                    </p>
                  </div>
                  <Badge variant={slot.availableBBQs > 0 ? "success" : "destructive"}>
                    {slot.availableBBQs > 0 ? "Available" : "Fully Booked"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
