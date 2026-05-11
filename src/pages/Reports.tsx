import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useAttendanceRange } from '@/hooks/useAttendance';
import { useLiveClock } from '@/hooks/useLiveClock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF, importFromExcel, type ExportRow } from '@/lib/exportUtils';
import { generateReportHtml, downloadHtml } from '@/lib/htmlExport';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Period = 'today' | 'week' | 'month' | 'custom';

export default function Reports() {
  const { now } = useLiveClock();

  const [period, setPeriod] = useState<Period>('week');
  const [customStart, setCustomStart] = useState(format(subDays(now, 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(now, 'yyyy-MM-dd'));
  const [classFilter, setClassFilter] = useState('');

  const dateRange = useMemo(() => {
    switch (period) {
      case 'today':
        return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'week':
        return {
          start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'custom':
        return { start: customStart, end: customEnd };
    }
  }, [period, customStart, customEnd, now]);

  const { data, loading } = useAttendanceRange(dateRange.start, dateRange.end);

  // Flatten to rows
  const rows: ExportRow[] = useMemo(() => {
    const result: ExportRow[] = [];
    let no = 1;
    const sortedDates = Object.keys(data).sort();
    for (const date of sortedDates) {
      const day = data[date];
      for (const [, rec] of Object.entries(day)) {
        if (rec.count > 0) {
          if (classFilter && rec.className !== classFilter) continue;
          result.push({
            no: no++,
            studentName: rec.studentName,
            className: rec.className,
            date: format(new Date(date + 'T00:00:00'), 'dd MMMM yyyy', { locale: id }),
            count: rec.count,
            times: (rec.times || []).join(', '),
          });
        }
      }
    }
    return result;
  }, [data, classFilter]);

  // Summary stats
  const uniqueStudents = useMemo(() => {
    const set = new Set(rows.map((r) => r.studentName));
    return set.size;
  }, [rows]);

  const totalIncidents = useMemo(() => rows.reduce((s, r) => s + r.count, 0), [rows]);

  // Unique classes for filter
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    Object.values(data).forEach((day) => {
      Object.values(day).forEach((rec) => {
        if (rec.className) set.add(rec.className);
      });
    });
    return [...set].sort();
  }, [data]);

  const periodLabel = {
    today: `Hari Ini (${format(now, 'dd MMM', { locale: id })})`,
    week: `Minggu Ini (${format(startOfWeek(now, { weekStartsOn: 1 }), 'dd', { locale: id })}–${format(endOfWeek(now, { weekStartsOn: 1 }), 'dd MMM', { locale: id })})`,
    month: `Bulan Ini (${format(now, 'MMMM yyyy', { locale: id })})`,
    custom: `${format(new Date(customStart + 'T00:00:00'), 'dd MMM', { locale: id })} – ${format(new Date(customEnd + 'T00:00:00'), 'dd MMM yyyy', { locale: id })}`,
  }[period];

  const filename = `Laporan_Kesiangan_${dateRange.start}_${dateRange.end}`;

  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    exportToExcel(rows, filename);
    toast.success('File Excel berhasil diunduh');
  };

  const handleExportPDF = () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    exportToPDF(rows, filename, 'LAPORAN SISWA KESIANGAN', `Periode: ${periodLabel}`);
    toast.success('File PDF berhasil diunduh');
  };

  const handleExportHtml = () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const html = generateReportHtml(rows, 'LAPORAN SISWA KESIANGAN', `Periode: ${periodLabel}`);
    downloadHtml(html, filename + '.html');
    toast.success('File HTML berhasil diunduh — buka di browser untuk melihat laporan');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedRows = await importFromExcel(file);
      toast.success(`Berhasil mengimpor ${importedRows.length} baris data`);
    } catch {
      toast.error('Gagal mengimpor file. Pastikan format file sesuai.');
    }
    e.target.value = '';
  };

  return (
    <Layout title="Laporan Kesiangan">
      <div className="space-y-5">
        {/* Period Selector */}
        <div className="bg-card rounded-xl border-2 border-border shadow-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Pilih Periode Laporan</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['today', 'week', 'month', 'custom'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  period === p
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {{ today: 'Hari Ini', week: 'Minggu Ini', month: 'Bulan Ini', custom: 'Kustom' }[p]}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Dari Tanggal</Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sampai Tanggal</Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <button
                onClick={() => setClassFilter('')}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  !classFilter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                Semua Kelas
              </button>
              {availableClasses.map((c) => (
                <button
                  key={c}
                  onClick={() => setClassFilter(c === classFilter ? '' : c)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                    classFilter === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary + Actions */}
        <div className="flex flex-wrap items-start gap-4">
          {/* Summary */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-primary/70">Siswa Kesiangan</p>
                <p className="text-sm font-bold text-primary">{uniqueStudents}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <div>
                <p className="text-xs text-destructive/70">Total Kejadian</p>
                <p className="text-sm font-bold text-destructive">{totalIncidents}</p>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/10"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHtml}
              className="gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
            >
              <Globe className="w-3.5 h-3.5" />
              HTML
            </Button>
            <label>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
                onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                Impor
              </Button>
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-sm">Data Kesiangan</h3>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {rows.length} baris
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">Memuat data...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Tidak ada data kesiangan</p>
              <p className="text-xs text-muted-foreground mt-1">untuk periode yang dipilih</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-10">No</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Nama Siswa</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Kelas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tanggal</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Jumlah</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Jam Kesiangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.no} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.no}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{row.studentName}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {row.className}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.date}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                            row.count > 3
                              ? 'bg-destructive/15 text-destructive'
                              : row.count > 1
                              ? 'bg-accent/15 text-accent'
                              : 'bg-primary/15 text-primary'
                          )}
                        >
                          {row.count}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">{row.times}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
