import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEncounterTimerProps {
  encounterId: string | null;
  startedAt: Date | null;
  isActive: boolean;
}

interface UseEncounterTimerReturn {
  elapsedSeconds: number;
  formattedTime: string;
  start: () => void;
  stop: () => number;
}

export const useEncounterTimer = ({
  encounterId,
  startedAt,
  isActive,
}: UseEncounterTimerProps): UseEncounterTimerReturn => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateElapsed = useCallback(() => {
    if (!startedAt) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1000);
  }, [startedAt]);

  useEffect(() => {
    if (isActive && startedAt) {
      // Initialize with current elapsed time
      setElapsedSeconds(calculateElapsed());

      // Update every second
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startedAt, calculateElapsed]);

  // Persist timer state to localStorage
  useEffect(() => {
    if (encounterId && isActive) {
      localStorage.setItem(`encounter_timer_${encounterId}`, JSON.stringify({
        startedAt: startedAt?.toISOString(),
        isActive,
      }));
    }
  }, [encounterId, startedAt, isActive]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const start = useCallback(() => {
    setElapsedSeconds(0);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (encounterId) {
      localStorage.removeItem(`encounter_timer_${encounterId}`);
    }
    return elapsedSeconds;
  }, [elapsedSeconds, encounterId]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    start,
    stop,
  };
};
