import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "./ui/card";

interface CountdownTimerProps {
  eventDate: string | Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ eventDate }) => {
  interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [error, setError] = useState('');

  const parseDate = (dateString: string | Date) => {
    // Try parsing different date formats
    let parsedDate;
    
    // If it's already a Date object
    if (dateString instanceof Date) {
      parsedDate = dateString;
    } 
    // If it's a time string like "10:10AM" or "10:10 AM"
    else if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(dateString)) {
      const [time, meridiem] = dateString.split(/\s+/);
      const [hours, minutes] = time.split(':');
      
      parsedDate = new Date();
      let hour = parseInt(hours, 10);
      
      // Convert to 24-hour format
      if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      parsedDate.setHours(hour, parseInt(minutes, 10), 0, 0);
      
      // If the time has already passed today, set it for tomorrow
      if (parsedDate < new Date()) {
        parsedDate.setDate(parsedDate.getDate() + 1);
      }
    } 
    // Try standard date parsing for ISO strings and other formats
    else {
      parsedDate = new Date(dateString);
    }
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Please use "HH:MMAM/PM" or a valid date string.');
    }
    
    return parsedDate;
  };

  const calculateTimeLeft = useCallback(() => {
      try {
        const eventTime = parseDate(eventDate).getTime();
        const currentTime = new Date().getTime();
        const difference = eventTime - currentTime;
  
        // If the event has started, return zeros
        if (difference < 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }
  
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          isExpired: false
        };
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
        return null;
      }
    }, [eventDate]);
  
    useEffect(() => {
      // Initial calculation
      setTimeLeft(calculateTimeLeft());
  
      // Set up the interval
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
  
      // Cleanup
      return () => clearInterval(timer);
    }, [eventDate, calculateTimeLeft]); // Dependency on eventDate and calculateTimeLeft

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!timeLeft) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const TimeUnit: React.FC<{ value: number; unit: string }> = ({ value, unit }) => (
    <div className="flex flex-col items-center mx-2">
      <div className="text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
      <div className="text-sm text-gray-500">{unit}</div>
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        {timeLeft.isExpired ? (
          <div className="text-xl font-bold text-red-500">
            Event has started!
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <TimeUnit value={timeLeft.days} unit="days" />
            <TimeUnit value={timeLeft.hours} unit="hours" />
            <TimeUnit value={timeLeft.minutes} unit="minutes" />
            <TimeUnit value={timeLeft.seconds} unit="seconds" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;