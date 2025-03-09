import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { SlotAvailability } from "@shared/schema";

interface TimeSlotPickerProps {
  onSelectDate: (date: Date) => void;
  onSelectSlot: (slot: string) => void;
  selectedDate: Date | undefined;
  selectedSlot: string | undefined;
}

export function TimeSlotPicker({
  onSelectDate,
  onSelectSlot,
  selectedDate,
  selectedSlot,
}: TimeSlotPickerProps) {
  // Fetch availability data when a date is selected
  const { data: availability, isLoading } = useQuery<SlotAvailability[]>({
    queryKey: ["/api/availability", { date: selectedDate?.toISOString() }],
    enabled: !!selectedDate,
  });

  console.log("Selected date:", selectedDate);
  console.log("Availability data:", availability);

  // Disable past dates
  const disabledDays = { before: new Date() };

  // Helper function to format time slots nicely
  const formatTimeSlot = (slot: string) => {
    const [start, end] = slot.split('-');
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          console.log("Calendar date selected:", date);
          date && onSelectDate(date);
        }}
        disabled={disabledDays}
        className="rounded-md border"
      />

      {selectedDate && (
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center p-4">Loading availability...</div>
            ) : (
              <RadioGroup
                value={selectedSlot}
                onValueChange={onSelectSlot}
              >
                <div className="space-y-4">
                  {availability?.map((slot) => (
                    <div key={slot.timeSlot} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={slot.timeSlot} 
                        id={slot.timeSlot}
                        disabled={slot.availableBBQs <= 0}
                      />
                      <Label htmlFor={slot.timeSlot}>
                        <div className="flex items-center gap-2">
                          <span>{formatTimeSlot(slot.timeSlot)}</span>
                          {slot.availableBBQs > 0 ? (
                            <Badge variant="default">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Booked
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}