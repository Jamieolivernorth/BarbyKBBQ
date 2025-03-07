import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const timeSlots = ["12-6pm", "6-10pm"];

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        disabled={disabledDays}
        className="rounded-md border"
      />

      <Card>
        <CardContent className="pt-6">
          <RadioGroup
            value={selectedSlot}
            onValueChange={onSelectSlot}
          >
            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <RadioGroupItem value={slot} id={slot} />
                  <Label htmlFor={slot}>{slot}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
