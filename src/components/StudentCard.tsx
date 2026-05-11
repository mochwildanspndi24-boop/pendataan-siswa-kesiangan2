import { useState } from 'react';
import { User, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  studentId: string;
  name: string;
  className: string;
  count: number;
  times: string[];
  onMark: (studentId: string, name: string, className: string) => Promise<void>;
}

function getCountColor(count: number) {
  if (count === 0) return 'bg-muted text-muted-foreground';
  if (count === 1) return 'bg-school-green text-white';
  if (count <= 3) return 'bg-accent text-accent-foreground';
  return 'bg-destructive text-destructive-foreground';
}

function getCardBorder(count: number) {
  if (count === 0) return 'border-border hover:border-primary/40';
  if (count === 1) return 'border-school-green/40 hover:border-school-green/70';
  if (count <= 3) return 'border-accent/40 hover:border-accent/70';
  return 'border-destructive/40 hover:border-destructive/70 animate-pulse';
}

function getCardBg(count: number) {
  if (count === 0) return 'bg-card';
  if (count === 1) return 'bg-school-green-light dark:bg-school-green-light/10';
  if (count <= 3) return 'bg-school-gold-light dark:bg-school-gold-light/10';
  return 'bg-destructive/5';
}

export function StudentCard({ studentId, name, className, count, times, onMark }: StudentCardProps) {
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setAnimate(true);
    try {
      await onMark(studentId, name, className);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimate(false), 300);
    }
  };

  const latestTime = times && times.length > 0 ? times[times.length - 1] : null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'relative w-full text-left rounded-xl border-2 p-3 transition-all duration-200',
        'select-none active:scale-[0.97] hover:shadow-card',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        getCardBorder(count),
        getCardBg(count),
        animate && 'card-mark-animation',
        loading && 'opacity-70 cursor-wait'
      )}
    >
      {/* Count Badge */}
      {count > 0 && (
        <div
          className={cn(
            'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md',
            getCountColor(count),
            count > 3 && 'animate-count-bounce w-7 h-7 text-sm'
          )}
        >
          {count}
        </div>
      )}

      {/* Alert for > 3 */}
      {count > 3 && (
        <div className="absolute top-1 left-1">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        </div>
      )}

      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
            count === 0 && 'bg-muted',
            count === 1 && 'bg-school-green/20',
            count > 1 && count <= 3 && 'bg-accent/20',
            count > 3 && 'bg-destructive/20'
          )}
        >
          <User
            className={cn(
              'w-4 h-4',
              count === 0 && 'text-muted-foreground',
              count === 1 && 'text-school-green',
              count > 1 && count <= 3 && 'text-accent',
              count > 3 && 'text-destructive'
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
            {name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{className}</p>
          {latestTime && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">{latestTime.slice(0, 5)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
