
'use client';
import { useState, useEffect } from 'react';

const calculateTimeLeft = (targetDate: Date | null) => {
  if (!targetDate) {
    return { hours: '00', minutes: 'O0', seconds: '00', totalSeconds: 0, isUp: true };
  }
  
  const now = new Date().getTime();
  const distance = targetDate.getTime() - now;

  if (distance <= 0) {
    return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isUp: true };
  }

  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    totalSeconds: Math.floor(distance / 1000),
    isUp: false,
  };
};

export const useTimer = (targetDate: Date | null) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    // Recalculate initial state when targetDate changes
    setTimeLeft(calculateTimeLeft(targetDate));

    if (!targetDate || targetDate.getTime() <= new Date().getTime()) {
      setTimeLeft({ hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isUp: true });
      return;
    }

    const interval = setInterval(() => {
        const updatedTime = calculateTimeLeft(targetDate);
        setTimeLeft(updatedTime);
        if(updatedTime.isUp) {
            clearInterval(interval);
        }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate?.getTime()]);

  return timeLeft;
};
