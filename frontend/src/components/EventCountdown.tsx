import React, { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface EventCountdownProps {
  date: string;  // Expected format: 'YYYY-MM-DD'
  time: string;  // Expected format: 'HH:MM' (24-hour format)
}

interface TimeUnitProps {
  value: number;
  unit: string;
}

const EventCountdown: React.FC<EventCountdownProps> = ({ date, time }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      try {
        // Combine date and time strings
        const eventDateTime = new Date(`${date}T${time}`);
        const currentTime = new Date().getTime();
        const difference = eventDateTime.getTime() - currentTime;

        // If the event has started or invalid date, return zeros
        if (difference < 0 || isNaN(difference)) {
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
        console.error('Error calculating time:', err);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up the interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [date, time]);

  if (!timeLeft) {
    return <div className="text-sm text-gray-500">Calculating...</div>;
  }

  const TimeUnit: React.FC<TimeUnitProps> = ({ value, unit }) => (
    <span className="mx-1">
      {value.toString().padStart(2, '0')}{unit}
    </span>
  );

  return (
    <div className="text-sm text-gray-500">
      {timeLeft.isExpired ? (
        <div className="text-red-500">Event has started!</div>
      ) : (
        <div>
          <TimeUnit value={timeLeft.days} unit="d" />
          <TimeUnit value={timeLeft.hours} unit="h" />
          <TimeUnit value={timeLeft.minutes} unit="m" />
          <TimeUnit value={timeLeft.seconds} unit="s" />
        </div>
      )}
    </div>
  );
};

export default EventCountdown;