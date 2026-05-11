import { useEffect, useState, useCallback } from 'react';
import { db, ref, onValue, update, get } from '@/lib/firebase';
import { format } from 'date-fns';
import type { AttendanceRecord, DailyAttendance } from '@/lib/types';

export function useAttendance(date?: string) {
  const [attendance, setAttendance] = useState<DailyAttendance>({});
  const [loading, setLoading] = useState(true);

  const today = date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const attendanceRef = ref(db, `attendance/${today}`);
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      setAttendance(snapshot.val() || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, [today]);

  const markLate = useCallback(
    async (studentId: string, studentName: string, className: string) => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');
      const attendanceRef = ref(db, `attendance/${today}/${studentId}`);

      const snapshot = await get(attendanceRef);
      const current: AttendanceRecord = snapshot.val() || {
        count: 0,
        times: [],
        studentName,
        className,
        lastUpdated: 0,
      };

      await update(attendanceRef, {
        count: (current.count || 0) + 1,
        times: [...(current.times || []), currentTime],
        studentName,
        className,
        lastUpdated: Date.now(),
      });
    },
    [today]
  );

  const undoLate = useCallback(
    async (studentId: string) => {
      const attendanceRef = ref(db, `attendance/${today}/${studentId}`);
      const snapshot = await get(attendanceRef);
      if (!snapshot.exists()) return;

      const current: AttendanceRecord = snapshot.val();
      if (current.count <= 0) return;

      const newTimes = [...(current.times || [])];
      newTimes.pop();

      await update(attendanceRef, {
        count: current.count - 1,
        times: newTimes,
        lastUpdated: Date.now(),
      });
    },
    [today]
  );

  return { attendance, loading, markLate, undoLate, today };
}

export function useAttendanceRange(startDate: string, endDate: string) {
  const [data, setData] = useState<Record<string, DailyAttendance>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const attendanceRef = ref(db, 'attendance');
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      const allData: Record<string, DailyAttendance> = snapshot.val() || {};
      // Filter by date range
      const filtered: Record<string, DailyAttendance> = {};
      Object.entries(allData).forEach(([date, records]) => {
        if (date >= startDate && date <= endDate) {
          filtered[date] = records;
        }
      });
      setData(filtered);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [startDate, endDate]);

  return { data, loading };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connRef, (snapshot) => {
      setIsOnline(snapshot.val() === true);
    });
    return () => unsubscribe();
  }, []);

  return isOnline;
}
