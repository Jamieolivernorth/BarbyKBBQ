import { SlotAvailability } from '@shared/schema';
import { useAvailability } from '@/hooks/use-availability';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AvailabilityDisplayProps {
  selectedDate?: Date;
  onSlotSelect?: (slot: string) => void;
}

export function AvailabilityDisplay({ selectedDate, onSlotSelect }: AvailabilityDisplayProps) {
  const { availability, isConnected } = useAvailability();

  const relevantSlots = availability.filter(slot => 
    selectedDate && 
    new Date(slot.date).toDateString() === selectedDate.toDateString()
  );

  const handleSlotSelect = (slot: SlotAvailability) => {
    if (onSlotSelect && slot.availableBBQs > 0) {
      onSlotSelect(slot.timeSlot);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge variant={isConnected ? "outline" : "destructive"}>
          {isConnected ? "Live Updates" : "Offline"}
        </Badge>
      </div>

      {selectedDate && (
        <div className="grid gap-4">
          {relevantSlots.map((slot) => (
            <Card 
              key={slot.timeSlot}
              className={slot.availableBBQs > 0 ? 'cursor-pointer hover:border-orange-500' : ''}
              onClick={() => handleSlotSelect(slot)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{slot.timeSlot}</p>
                    {slot.availableBBQs > 0 ? (
                      <p className="text-sm text-gray-500">
                        {slot.availableBBQs} BBQ{slot.availableBBQs !== 1 ? 's' : ''} Available
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-red-500">Fully Booked</p>
                        {slot.nextAvailableSlot && (
                          <p className="text-sm text-gray-500">
                            Next available: {slot.nextAvailableSlot}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={slot.availableBBQs > 0 ? "outline" : "destructive"}>
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