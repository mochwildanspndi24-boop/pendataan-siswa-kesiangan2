import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Trophy,
  RefreshCw,
  ClipboardCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { useAttendance, useAttendanceRange, useOnlineStatus } from '@/hooks/useAttendance';
import { useLiveClock } from '@/hooks/useLiveClock';
import { useSettings } from '@/hooks/useStudents';
import { format, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { attendance, today } = useAttendance();
  const { now } = useLiveClock();
  const { lateTime } = useSettings();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(now, 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const { data: weekData } = useAttendanceRange(weekStart, weekEnd);
  const { data: monthData } = useAttendanceRange(monthStart, monthEnd);

  // Today's stats
  const todayEntries = Object.entries(attendance);
  const todayTotal = todayEntries.reduce((sum, [, rec]) => sum + (rec.count || 0), 0);
  const todayStudents = todayEntries.filter(([, rec]) => rec.count > 0).length;

  // Week stats
  const weekStudents = useMemo(() => {
    const set = new Set<string>();
    Object.values(weekData).forEach((day) =>
      Object.keys(day).forEach((id) => {
        if ((day[id]?.count || 0) > 0) set.add(id);
      })
    );
    return set.size;
  }, [weekData]);

  // Month stats
  const monthStudents = useMemo(() => {
    const set = new Set<string>();
    Object.values(monthData).forEach((day) =>
      Object.keys(day).forEach((id) => {
        if ((day[id]?.count || 0) > 0) set.add(id);
      })
    );
    return set.size;
  }, [monthData]);

  // Top late student this month
  const topStudents = useMemo(() => {
    const counts: Record<string, { name: string; className: string; count: number }> = {};
    Object.values(monthData).forEach((day) => {
      Object.entries(day).forEach(([sid, rec]) => {
        if (!counts[sid])
          counts[sid] = { name: rec.studentName, className: rec.className, count: 0 };
        counts[sid].count += rec.count || 0;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [monthData]);

  // Today's late list (sorted by last update)
  const todayLateList = useMemo(() => {
    return todayEntries
      .filter(([, rec]) => rec.count > 0)
      .sort((a, b) => (b[1].lastUpdated || 0) - (a[1].lastUpdated || 0))
      .slice(0, 10);
  }, [todayEntries]);

  const [lh, lm] = lateTime.split(':').map(Number);
  const isCurrentlyLateTime =
    now.getHours() * 60 + now.getMinutes() >= lh * 60 + lm;

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Late Time Banner */}
        <div
          className={cn(
            'rounded-xl p-4 flex items-center justify-between border-2',
            isCurrentlyLateTime
              ? 'bg-destructive/10 border-destructive/30'
              : 'bg-school-green-light border-primary/20'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isCurrentlyLateTime ? 'bg-destructive/20' : 'bg-primary/15'
              )}
            >
              <Clock className={cn('w-5 h-5', isCurrentlyLateTime ? 'text-destructive' : 'text-primary')} />
            </div>
            <div>
              <p className={cn('font-bold text-sm', isCurrentlyLateTime ? 'text-destructive' : 'text-primary')}>
                {isCurrentlyLateTime ? 'Jam Kesiangan Aktif' : 'Belum Jam Kesiangan'}
              </p>
              <p className="text-xs text-muted-foreground">
                Batas jam masuk: <strong>{lateTime}</strong> WIB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Online Status Badge */}
            <div
              className={cn(
                'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                isOnline
                  ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                  : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
              )}
            >
              {isOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <Wifi className="w-3 h-3" />
                  Online
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <WifiOff className="w-3 h-3" />
                  Offline
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-1.5 h-8"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/attendance')}
              className="gap-1.5 h-8 bg-primary text-primary-foreground"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Absen
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Kesiangan Hari Ini"
            value={todayStudents}
            subtitle={`${todayTotal} total kejadian`}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title="Kesiangan Minggu Ini"
            value={weekStudents}
            subtitle={`${format(startOfWeek(now, { weekStartsOn: 1 }), 'dd MMM', { locale: id })} - ${format(now, 'dd MMM', { locale: id })}`}
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            title="Kesiangan Bulan Ini"
            value={monthStudents}
            subtitle={format(now, 'MMMM yyyy', { locale: id })}
            icon={TrendingUp}
            variant="gold"
          />
          <StatCard
            title="Paling Sering"
            value={topStudents[0]?.[1]?.count ?? 0}
            subtitle={topStudents[0]?.[1]?.name ?? 'Belum ada data'}
            icon={Trophy}
            variant="primary"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Late Students */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Kesiangan Hari Ini</h3>
                <p className="text-xs text-muted-foreground">
                  {format(now, 'EEEE, dd MMMM yyyy', { locale: id })}
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {todayStudents} siswa
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {todayLateList.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada yang kesiangan hari ini</p>
                </div>
              ) : (
                todayLateList.map(([sid, rec]) => (
                  <div key={sid} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        rec.count > 3
                          ? 'bg-destructive/15 text-destructive'
                          : rec.count > 1
                          ? 'bg-accent/15 text-accent'
                          : 'bg-primary/15 text-primary'
                      )}
                    >
                      {rec.count}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rec.studentName}</p>
                      <p className="text-xs text-muted-foreground">{rec.className}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-muted-foreground">
                        {rec.times?.[rec.times.length - 1]?.slice(0, 5) ?? '-'}
                      </p>
                      {rec.count > 3 && (
                        <p className="text-[10px] text-destructive font-semibold">SERING</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {todayStudents > 10 && (
              <div className="px-5 py-3 border-t border-border">
                <button
                  onClick={() => navigate('/reports')}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  Lihat semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Top Late Students This Month */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Siswa Paling Sering Kesiangan</h3>
                <p className="text-xs text-muted-foreground">{format(now, 'MMMM yyyy', { locale: id })}</p>
              </div>
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div className="divide-y divide-border">
              {topStudents.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada data bulan ini</p>
                </div>
              ) : (
                topStudents.map(([, student], idx) => (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        idx === 0 && 'bg-yellow-100 text-yellow-700',
                        idx === 1 && 'bg-gray-100 text-gray-600',
                        idx === 2 && 'bg-orange-100 text-orange-600',
                        idx > 2 && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.className}</p>
                    </div>
                    <Badge
                      className={cn(
                        'font-bold',
                        student.count > 10
                          ? 'bg-destructive/15 text-destructive border-destructive/20'
                          : 'bg-accent/15 text-accent border-accent/20'
                      )}
                    >
                      {student.count}x
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button
                onClick={() => navigate('/statistics')}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Lihat statistik lengkap <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
