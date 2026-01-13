
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServerBoss } from "@/lib/server-bosses";
import { useToast } from "@/hooks/use-toast";

type SetServerTimeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSetTime: () => void;
  boss: ServerBoss;
  dayOfWeek: string;
  setDayOfWeek: (day: string) => void;
  hour: string;
  setHour: (hour: string) => void;
  minute: string;
  setMinute: (minute: string) => void;
  period: string;
  setPeriod: (period: string) => void;
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SetServerTimeDialog({
  isOpen,
  onOpenChange,
  onSetTime,
  boss,
  dayOfWeek,
  setDayOfWeek,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
}: SetServerTimeDialogProps) {

  const { toast } = useToast();

  const handleSetTime = () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) {
      toast({
        variant: "destructive",
        title: "Invalid Time",
        description: "Please enter a valid time (1-12 for hour, 0-59 for minute).",
      });
      return;
    }
     if (!dayOfWeek) {
      toast({
        variant: "destructive",
        title: "Invalid Day",
        description: "Please select a day of the week.",
      });
      return;
    }

    onSetTime();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Set Respawn Time for {boss.name}</DialogTitle>
          <DialogDescription>
            Select the upcoming day and time the boss will respawn (GMT+8).
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
           <div className="flex flex-col gap-2">
              <Label htmlFor="day-of-week">Day of the Week</Label>
               <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day-of-week">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hour">
                Hour
              </Label>
              <Input
                id="hour"
                type="number"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="8"
                min="1"
                max="12"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="minute">
                Minute
              </Label>
              <Input
                id="minute"
                type="number"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="30"
                min="0"
                max="59"
              />
            </div>
            <div className="flex flex-col gap-2 self-end">
              <Label htmlFor="period" className="sr-only">
                AM/PM
              </Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSetTime}>Set Respawn Timer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
