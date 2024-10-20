import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  eventDate: string; // Expecting date in ISO format
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ eventDate }) => {
  const calculateTimeLeft = () => {
    const eventTime = new Date(eventDate).getTime();
    const currentTime = new Date().getTime();
    const difference = eventTime - currentTime;

    // If the event has started, return zeros
    if (difference < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Clear the timer on unmount
  }, [eventDate]);

  return (
    <div className="text-lg font-bold">
      {/* Conditional rendering based on the time left */}
      {timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0 ? (
        <div>
          <span>{timeLeft.days}d </span>
          <span>{timeLeft.hours}h </span>
          <span>{timeLeft.minutes}m </span>
          <span>{timeLeft.seconds}s</span>
        </div>
      ) : (
        <span className="text-red-500">Event has started!</span>
      )}
    </div>
  );
};

export default CountdownTimer;
