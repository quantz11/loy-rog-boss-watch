
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

type SetTimeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSetTime: (date: Date) => void;
  bossName: string;
};

export function SetTimeDialog({ isOpen, onOpenChange, onSetTime, bossName }: SetTimeDialogProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState("PM");
  const { toast } = useToast();
  const timeZoneOffset = 8 * 60; // GMT+8 in minutes

  useEffect(() => {
    if (isOpen) {
      // Calculate current time in GMT+8
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const gmt8Time = new Date(utc + (timeZoneOffset * 60000));

      let h = gmt8Time.getUTCHours();
      const m = gmt8Time.getUTCMinutes();
      let p = "AM";

      if (h >= 12) {
        p = "PM";
      }
      if (h > 12) {
        h -= 12;
      }
      if (h === 0) {
        h = 12; // 12 AM
      }
      
      setHour(h.toString());
      setMinute(m.toString().padStart(2, '0'));
      setPeriod(p);
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

    // Get current date parts in GMT+8
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const gmt8Now = new Date(utc + (timeZoneOffset * 60000));
    
    const year = gmt8Now.getUTCFullYear();
    const month = gmt8Now.getUTCMonth();
    const day = gmt8Now.getUTCDate();

    // Create the target date object in UTC with the user's time
    const targetTime = new Date(Date.UTC(year, month, day, hour24, m, 0));

    // If the calculated time is in the future relative to the real current time,
    // it must have been from the previous day.
    if (targetTime > now) {
      targetTime.setUTCDate(targetTime.getUTCDate() - 1);
    }
    
    onSetTime(targetTime);
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
