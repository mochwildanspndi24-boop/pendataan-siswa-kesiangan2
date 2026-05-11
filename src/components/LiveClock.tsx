import { useLiveClock } from '@/hooks/useLiveClock';
import { Clock } from 'lucide-react';

interface LiveClockProps {
  className?: string;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LiveClock({ className = '', showDate = true, size = 'md' }: LiveClockProps) {
  const { timeStr, dateStr } = useLiveClock();

  const timeClass = {
    sm: 'text-sm font-mono font-semibold',
    md: 'text-xl font-mono font-bold',
    lg: 'text-3xl font-mono font-bold',
  }[size];

  const dateClass = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <div className={`flex items-center gap-1.5 ${timeClass} text-sidebar-foreground`}>
        <Clock className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
        <span className="tabular-nums">{timeStr}</span>
      </div>
      {showDate && (
        <span className={`${dateClass} text-sidebar-foreground/70 capitalize`}>{dateStr}</span>
      )}
    </div>
  );
}
