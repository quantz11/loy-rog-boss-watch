
"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { Boss } from "@/lib/bosses";

type SetTimeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSetTime: (date: Date) => void;
  boss: Boss;
};

export function SetTimeDialog({ isOpen, onOpenChange, onSetTime, boss }: SetTimeDialogProps) {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("PM");
  const { toast } = useToast();

  const bossName = `[${boss.type.charAt(0).toUpperCase() + boss.type.slice(1)}] ${boss.name} - ${boss.floor}F`;

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      
      // Get current time in Asia/Singapore timezone (GMT+8)
      const timeString = now.toLocaleString('en-US', {
        timeZone: 'Asia/Singapore',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

      // E.g., "8:30 PM"
      const [time, periodStr] = timeString.split(' ');
      const [hourStr, minuteStr] = time.split(':');

      setHour(hourStr);
      setMinute(minuteStr);
      setPeriod(periodStr);
    }
  }, [isOpen]);

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

    let hour24 = h;
    if (period === 'PM' && h < 12) {
      hour24 += 12;
    } else if (period === 'AM' && h === 12) { // 12 AM is 00 hours
      hour24 = 0;
    }

    // Create a date object representing today in GMT+8
    const nowInGmt8 = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    
    // Set the time from user input
    nowInGmt8.setHours(hour24, m, 0, 0);

    // Create a final date object from the GMT+8 parts. 
    // This will be interpreted by the browser in its local timezone, so we need to account for the offset.
    const year = nowInGmt8.getFullYear();
    const month = nowInGmt8.getMonth();
    const day = nowInGmt8.getDate();

    // Construct a UTC date then adjust. This is more reliable.
    let finalDate = new Date(Date.UTC(year, month, day, hour24, m, 0) - (8 * 60 * 60 * 1000));
    
    // If the calculated time is in the future, it must have been from the previous day
    if (finalDate > new Date()) {
      finalDate.setDate(finalDate.getDate() - 1);
    }
    
    onSetTime(finalDate);
    onOpenChange(false); // Close the dialog on success
  };
  
  const handleCancel = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Defeated Time for {bossName}</DialogTitle>
          <DialogDescription>
            Enter the time the boss was defeated in 12-hour format (GMT+8). The form defaults to the current time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 items-center gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="hour" className="text-right">
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
            <Label htmlFor="minute" className="text-right">
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
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSetTime}>Set Timer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
