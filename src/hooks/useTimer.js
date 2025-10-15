import { useState, useEffect } from 'react';

export const useTimer = (initialTime, active = false) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    let timer;
    if (active && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const reset = (time = initialTime) => {
    setTimeLeft(time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return { timeLeft, reset, formatTime: () => formatTime(timeLeft) };
};
