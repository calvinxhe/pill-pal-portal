import React from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EncounterTimerProps {
  formattedTime: string;
  isActive: boolean;
  patientName?: string;
  startedAt?: Date | null;
}

const EncounterTimer: React.FC<EncounterTimerProps> = ({
  formattedTime,
  isActive,
  patientName,
  startedAt,
}) => {
  const formatStartTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
        isActive
          ? 'bg-primary/10 border-primary'
          : 'bg-muted border-muted-foreground/20'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-full',
            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
          )}
        >
          {isActive ? (
            <Play className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm text-muted-foreground">
            {isActive ? 'Active Encounter' : 'No Active Encounter'}
          </p>
          {patientName && (
            <p className="font-semibold text-lg">{patientName}</p>
          )}
          {startedAt && (
            <p className="text-xs text-muted-foreground">
              Started: {formatStartTime(new Date(startedAt))}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span
          className={cn(
            'font-mono text-3xl font-bold tabular-nums',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default EncounterTimer;
