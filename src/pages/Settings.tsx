import { useState } from 'react';
import {
  Clock, Lock, Moon, Sun, AlertTriangle,
  Eye, EyeOff, CheckCircle, Mail, ShieldCheck, KeyRound,
  RotateCcw, Database, ChevronRight, ArrowLeft, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useStudents';
import { useResetDatabase } from '@/hooks/useStudents';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'wildanspndi24@gmail.com';

const LATE_TIMES = [
  { label: '06:00', value: '06:00' },
  { label: '06:30', value: '06:30' },
  { label: '07:00', value: '07:00' },
  { label: '07:15', value: '07:15' },
  { label: '07:30', value: '07:30' },
  { label: '07:45', value: '07:45' },
  { label: '08:00', value: '08:00' },
  { label: '08:30', value: '08:30' },
];

type PasswordStep = 'idle' | 'form' | 'otp' | 'success';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { requestPasswordChange, verifyOtpAndChangePassword, clearOtpState } = useAuth();
  const { lateTime, setLateTime } = useSettings();
  const { resetAttendance } = useResetDatabase();

  // Password change state
  const [pwStep, setPwStep] = useState<PasswordStep>('idle');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  // Reset state
  const [showResetAttDialog, setShowResetAttDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [confirmResetText, setConfirmResetText] = useState('');

  // Late time state
  const [ltLoading, setLtLoading] = useState(false);
  const [ltSuccess, setLtSuccess] = useState(false);

  const handleUpdateLateTime = async (time: string) => {
    setLtLoading(true);
    setLtSuccess(false);
    await setLateTime(time);
    setLtLoading(false);
    setLtSuccess(true);
    setTimeout(() => setLtSuccess(false), 2000);
  };

  const handleRequestOtp = async () => {
    setPwError('');
    if (!currentPass || !newPass || !confirmPass) {
      setPwError('Semua field harus diisi');
      return;
    }
    if (newPass !== confirmPass) {
      setPwError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    setPwLoading(true);
    const result = await requestPasswordChange(currentPass, newPass);
    setPwLoading(false);
    if (result.success) {
      setPwStep('otp');
      setPwError('');
    } else {
      setPwError(result.error || 'Gagal mengirim OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setPwError('');
    if (!otpCode || otpCode.length !== 6) {
      setPwError('Masukkan kode OTP 6 digit');
      return;
    }
    setPwLoading(true);
    const result = await verifyOtpAndChangePassword(otpCode);
    setPwLoading(false);
    if (result.success) {
      setPwStep('success');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setOtpCode('');
    } else {
      setPwError(result.error || 'Verifikasi gagal');
    }
  };

  const resetPasswordForm = () => {
    setPwStep('idle');
    setPwError('');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setOtpCode('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    clearOtpState();
  };

  const handleResetAttendance = async () => {
    setResetLoading(true);
    await resetAttendance();
    setResetLoading(false);
    setShowResetAttDialog(false);
    setResetSuccess('Data presensi berhasil direset! Data siswa dan kelas tetap aman.');
    setConfirmResetText('');
    setTimeout(() => setResetSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola konfigurasi sistem pendataan kesiangan</p>
      </div>

      {resetSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{resetSuccess}</p>
        </div>
      )}

      {/* Late Time */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Waktu Batas Keterlambatan</h2>
            <p className="text-xs text-muted-foreground">Siswa yang hadir setelah waktu ini dihitung terlambat</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-4 gap-2">
            {LATE_TIMES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleUpdateLateTime(t.value)}
                disabled={ltLoading}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
                  lateTime === t.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-elegant'
                    : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {ltSuccess && (
            <p className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Waktu keterlambatan diperbarui
            </p>
          )}
        </div>
      </div>

      {/* Dark Mode */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">Tampilan</h2>
              <p className="text-xs text-muted-foreground">
                Mode saat ini: <strong>{theme === 'dark' ? 'Gelap' : 'Terang'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors border-2',
              theme === 'dark'
                ? 'bg-primary border-primary'
                : 'bg-muted border-border'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Ubah Password Admin</h2>
            <p className="text-xs text-muted-foreground">
              Memerlukan verifikasi OTP via <span className="text-primary font-medium">{ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* STEP: IDLE */}
          {pwStep === 'idle' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Untuk keamanan, perubahan password memerlukan konfirmasi via email OTP ke{' '}
                <strong className="text-foreground">{ADMIN_EMAIL}</strong>
              </p>
              <Button
                onClick={() => { setPwStep('form'); setPwError(''); }}
                className="gap-2"
                variant="outline"
              >
                <KeyRound className="w-4 h-4" />
                Mulai Ubah Password
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP: FORM */}
          {pwStep === 'form' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={resetPasswordForm} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Langkah 1 dari 2 — Isi Password</span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-primary" />
                <div className="flex-1 h-1.5 rounded-full bg-muted" />
              </div>

              {pwError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {pwError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Password Saat Ini</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Password lama"
                    className="pl-9 pr-10 h-10 border-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="pl-9 pr-10 h-10 border-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={cn(
                      'pl-9 h-10 border-2',
                      confirmPass && newPass !== confirmPass ? 'border-destructive' : ''
                    )}
                  />
                </div>
                {confirmPass && newPass !== confirmPass && (
                  <p className="text-xs text-destructive">Password tidak cocok</p>
                )}
              </div>

              <Button
                onClick={handleRequestOtp}
                disabled={pwLoading || (confirmPass !== '' && newPass !== confirmPass)}
                className="w-full gap-2 bg-gradient-header text-white"
              >
                {pwLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Kirim OTP ke {ADMIN_EMAIL}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* STEP: OTP */}
          {pwStep === 'otp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => { setPwStep('form'); setPwError(''); }} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Langkah 2 dari 2 — Masukkan OTP</span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-primary" />
                <div className="flex-1 h-1.5 rounded-full bg-primary" />
              </div>

              {/* Info box */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Cek Email Admin</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                      Email OTP sudah dikirim ke{' '}
                      <strong>{ADMIN_EMAIL}</strong>. Minta admin membuka email dan berikan kode 6 digit.
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-1 font-medium">
                      Kode berlaku 30 menit
                    </p>
                  </div>
                </div>
              </div>

              {pwError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {pwError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide">Kode OTP (6 digit)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="h-14 text-center text-2xl font-mono font-bold tracking-widest border-2 focus:border-primary"
                />
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={pwLoading || otpCode.length !== 6}
                className="w-full gap-2 bg-gradient-header text-white"
              >
                {pwLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verifikasi & Ubah Password
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPwStep('form'); setPwError(''); }}
                className="w-full text-xs text-muted-foreground"
              >
                Belum terima OTP? Kirim ulang
              </Button>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {pwStep === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Password Berhasil Diubah!</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Password admin telah berhasil diperbarui. Gunakan password baru saat login berikutnya.
              </p>
              <Button onClick={resetPasswordForm} variant="outline" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Selesai
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Reset Data Presensi</h2>
            <p className="text-xs text-muted-foreground">Hapus semua data keterlambatan — data siswa &amp; kelas tetap aman</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
            <div>
              <p className="font-semibold text-sm text-orange-800 dark:text-orange-300">Reset Keterlambatan</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Semua data kesiangan dihapus. Nama siswa dan kelas tidak terpengaruh.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetAttDialog(true)}
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400 gap-1.5 flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Download HTML App Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Unduh Versi HTML</h2>
            <p className="text-xs text-muted-foreground">File HTML lengkap — bisa dibuka langsung tanpa instalasi</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
            <div>
              <p className="font-semibold text-sm text-blue-800 dark:text-blue-300">smk-kesiangan.html</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Seluruh fitur: Login, Presensi, Laporan, Pengaturan + 263 siswa. Butuh koneksi internet untuk Firebase.</p>
            </div>
            <a
              href="/smk-kesiangan.html"
              download="smk-kesiangan.html"
              className="ml-3 flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh
            </a>
          </div>
        </div>
      </div>

      {/* Reset Attendance Dialog */}
      <Dialog open={showResetAttDialog} onOpenChange={setShowResetAttDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Reset Data Presensi
            </DialogTitle>
            <DialogDescription>
              Semua data keterlambatan akan dihapus permanen. Data siswa dan kelas tetap aman.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground mb-3">
              Ketik <strong className="text-foreground">RESET</strong> untuk konfirmasi:
            </p>
            <Input
              value={confirmResetText}
              onChange={(e) => setConfirmResetText(e.target.value)}
              placeholder="Ketik RESET"
              className="font-mono border-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowResetAttDialog(false); setConfirmResetText(''); }}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetAttendance}
              disabled={resetLoading || confirmResetText !== 'RESET'}
              className="gap-2"
            >
              {resetLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Reset Presensi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
