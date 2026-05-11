import { useState, useMemo } from 'react';
import { Search, RefreshCw, Clock, Users, X, Info } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StudentCard } from '@/components/StudentCard';
import { useAttendance } from '@/hooks/useAttendance';
import { useStudents, useSettings } from '@/hooks/useStudents';
import { useLiveClock } from '@/hooks/useLiveClock';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Attendance() {
  const { attendance, markLate, undoLate, today } = useAttendance();
  const { students, classes, loading } = useStudents();
  const { lateTime } = useSettings();
  const { timeStr, dateStr, isLate } = useLiveClock();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const classMatch = selectedClass === 'all' || s.classId === selectedClass;
      const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      return classMatch && searchMatch;
    });
  }, [students, selectedClass, search]);

  // Count per class
  const classLateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const rec = attendance[s.id];
      if (rec && rec.count > 0) {
        counts[s.classId] = (counts[s.classId] || 0) + 1;
      }
    });
    return counts;
  }, [students, attendance]);

  const totalLateToday = useMemo(() => {
    return Object.values(attendance).filter((r) => r.count > 0).length;
  }, [attendance]);

  const handleMark = async (studentId: string, name: string, className: string) => {
    await markLate(studentId, name, className);
    const count = (attendance[studentId]?.count || 0) + 1;
    toast.success(`${name} — kesiangan ${count}x`, {
      description: `Jam: ${timeStr.slice(0, 5)} • ${className}`,
      duration: 2500,
    });
  };

  const handleUndo = async (studentId: string) => {
    const rec = attendance[studentId];
    if (!rec || rec.count <= 0) return;
    await undoLate(studentId);
    toast.info('Absen dibatalkan', { duration: 2000 });
  };

  const currentlyLate = isLate(lateTime);

  return (
    <Layout title="Absen Kesiangan">
      <div className="space-y-4">
        {/* Header info bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border shadow-card flex-1 min-w-0">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Jam Sekarang</p>
              <p className="text-sm font-bold font-mono tabular-nums text-foreground">{timeStr}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Batas Kesiangan</p>
              <p className={cn('text-sm font-bold', currentlyLate ? 'text-destructive' : 'text-primary')}>
                {lateTime} WIB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            <Users className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs text-destructive/70">Total Kesiangan</p>
              <p className="text-sm font-bold text-destructive">{totalLateToday} siswa</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-1.5 h-9 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Status Banner */}
        {currentlyLate && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive font-medium">
              Sudah melewati batas jam masuk ({lateTime}). Klik nama siswa untuk tandai kesiangan.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-2"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Class Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedClass('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              selectedClass === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            Semua
            <span
              className={cn(
                'text-xs rounded-full px-1.5 py-0.5',
                selectedClass === 'all' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              {students.length}
            </span>
          </button>
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            const lateCount = classLateCounts[cls.id] || 0;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                  selectedClass === cls.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                )}
              >
                {cls.name}
                <span
                  className={cn(
                    'text-xs rounded-full px-1.5 py-0.5',
                    selectedClass === cls.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {classStudents.length}
                </span>
                {lateCount > 0 && (
                  <span className="text-xs bg-destructive/20 text-destructive rounded-full px-1.5 py-0.5">
                    {lateCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Date header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground capitalize">
            {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
          </p>
          <p className="text-xs text-muted-foreground">{filteredStudents.length} siswa</p>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Tidak ada siswa ditemukan</p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-2 text-sm text-primary hover:underline">
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredStudents.map((student) => {
              const rec = attendance[student.id];
              return (
                <div key={student.id} className="relative">
                  <StudentCard
                    studentId={student.id}
                    name={student.name}
                    className={student.className}
                    count={rec?.count || 0}
                    times={rec?.times || []}
                    onMark={handleMark}
                  />
                  {rec && rec.count > 0 && (
                    <button
                      onClick={() => handleUndo(student.id)}
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-muted hover:bg-destructive/10 border border-border rounded-full flex items-center justify-center transition-colors"
                      title="Batalkan"
                    >
                      <X className="w-2.5 h-2.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium w-full">Keterangan warna badge:</p>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-school-green" />
            <span className="text-xs text-muted-foreground">1x (Ringan)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">2-3x (Sedang)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">4x+ (Sering)</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
