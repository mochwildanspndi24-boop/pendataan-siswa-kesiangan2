import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function useLiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = format(now, 'HH:mm:ss');
  const dateStr = format(now, 'EEEE, dd MMMM yyyy', { locale: id });
  const shortDate = format(now, 'yyyy-MM-dd');
  const shortTime = format(now, 'HH:mm');

  const isLate = (lateTime: string) => {
    const [lh, lm] = lateTime.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lateMinutes = lh * 60 + lm;
    return currentMinutes >= lateMinutes;
  };

  return { now, timeStr, dateStr, shortDate, shortTime, isLate };
}
