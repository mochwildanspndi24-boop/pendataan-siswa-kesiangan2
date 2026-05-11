import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart3, TrendingUp, PieChart, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Layout } from '@/components/Layout';
import { useAttendanceRange } from '@/hooks/useAttendance';
import { useLiveClock } from '@/hooks/useLiveClock';
import { Badge } from '@/components/ui/badge';

const COLORS = [
  'hsl(145, 55%, 40%)',
  'hsl(43, 75%, 48%)',
  'hsl(210, 70%, 50%)',
  'hsl(280, 65%, 55%)',
  'hsl(0, 65%, 55%)',
  'hsl(170, 65%, 45%)',
  'hsl(25, 85%, 55%)',
];

export default function Statistics() {
  const { now } = useLiveClock();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const { data, loading } = useAttendanceRange(monthStart, monthEnd);

  // Top 10 students this month
  const topStudents = useMemo(() => {
    const counts: Record<string, { name: string; className: string; count: number }> = {};
    Object.values(data).forEach((day) => {
      Object.entries(day).forEach(([sid, rec]) => {
        if (!counts[sid]) counts[sid] = { name: rec.studentName, className: rec.className, count: 0 };
        counts[sid].count += rec.count || 0;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  // Daily trend this month
  const dailyTrend = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(now),
      end: now,
    });
    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayData = data[dateKey] || {};
      const count = Object.values(dayData).reduce((s, r) => s + (r.count || 0), 0);
      return {
        date: format(day, 'dd', { locale: id }),
        count,
      };
    });
  }, [data, now]);

  // Per class stats
  const classStats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(data).forEach((day) => {
      Object.values(day).forEach((rec) => {
        if (!counts[rec.className]) counts[rec.className] = 0;
        counts[rec.className] += rec.count || 0;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Weekly trend
  const weeklyTrend = useMemo(() => {
    const weeks = eachWeekOfInterval(
      { start: startOfMonth(now), end: now },
      { weekStartsOn: 1 }
    );
    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const label = `${format(weekStart, 'dd', { locale: id })}–${format(weekEnd, 'dd MMM', { locale: id })}`;
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      let count = 0;
      days.forEach((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = data[dateKey] || {};
        count += Object.values(dayData).reduce((s, r) => s + (r.count || 0), 0);
      });
      return { label, count };
    });
  }, [data, now]);

  const totalMonthCount = useMemo(
    () => Object.values(data).reduce(
      (s, day) => s + Object.values(day).reduce((ss, r) => ss + (r.count || 0), 0),
      0
    ),
    [data]
  );

  const uniqueStudentsMonth = useMemo(() => {
    const set = new Set<string>();
    Object.values(data).forEach((day) => {
      Object.keys(day).forEach((id) => {
        if ((day[id]?.count || 0) > 0) set.add(id);
      });
    });
    return set.size;
  }, [data]);

  return (
    <Layout title="Statistik">
      <div className="space-y-6">
        {/* Month header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground text-lg capitalize">
              {format(now, 'MMMM yyyy', { locale: id })}
            </h2>
            <p className="text-xs text-muted-foreground">Statistik kesiangan bulan ini</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-primary/70">Total Kejadian</p>
              <p className="text-xl font-bold text-primary">{totalMonthCount}</p>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-destructive/70">Siswa Unik</p>
              <p className="text-xl font-bold text-destructive">{uniqueStudentsMonth}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Trend Chart */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm">Tren Harian</h3>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    name="Kesiangan"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weekly Trend */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-foreground text-sm">Tren Mingguan</h3>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Kesiangan" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Per Class Pie Chart */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm">Kesiangan per Kelas</h3>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : classStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie
                    data={classStats}
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={9}
                  >
                    {classStats.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 10 Students */}
          <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-destructive" />
              <h3 className="font-bold text-foreground text-sm">10 Siswa Paling Sering Kesiangan</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : topStudents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Belum ada data</div>
            ) : (
              <div className="space-y-2">
                {topStudents.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-muted-foreground text-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-foreground truncate">{student.name}</span>
                        <Badge
                          className={`ml-2 text-xs flex-shrink-0 ${
                            student.count > 10
                              ? 'bg-destructive/15 text-destructive border-destructive/20'
                              : 'bg-primary/15 text-primary border-primary/20'
                          }`}
                        >
                          {student.count}x
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min((student.count / (topStudents[0]?.count || 1)) * 100, 100)}%`,
                            background: idx === 0 ? COLORS[1] : COLORS[0],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
