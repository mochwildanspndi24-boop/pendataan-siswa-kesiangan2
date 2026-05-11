import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Lock, Mail, Wifi, WifiOff, Moon, Sun, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLiveClock } from '@/hooks/useLiveClock';
import { useOnlineStatus } from '@/hooks/useAttendance';
import { cn } from '@/lib/utils';

const SCHOOL_NAME = 'SMK DARUL MUTTAQIN CIANJUR';
const LOGO_URL = 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100050100/514a7296-7778-48.png';

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { timeStr, dateStr } = useLiveClock();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Username atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0%, transparent 55%),
                           radial-gradient(circle at 80% 70%, hsl(var(--accent)) 0%, transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 1px, transparent 1px, transparent 36px)`,
        }}
      />

      {/* Top Bar: Online Status + Theme Toggle */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4">
        {/* Online Status Badge - prominent */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm',
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
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">

          {/* School Identity Banner - ABOVE CARD, very prominent */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
                <div className="relative w-24 h-24 rounded-full border-4 border-primary/30 bg-gradient-header flex items-center justify-center p-2 shadow-elegant">
                  <img
                    src={LOGO_URL}
                    alt="Logo SMK Darul Muttaqin"
                    className="w-full h-full object-contain drop-shadow-md"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>

            {/* School Name - very prominent */}
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
              SMK DARUL MUTTAQIN
            </h1>
            <h2 className="text-xl font-bold text-primary mt-0.5 tracking-wide">
              CIANJUR
            </h2>
            <div className="h-0.5 w-16 bg-gradient-gold rounded-full mx-auto mt-2 mb-2" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Sistem Pendataan Siswa Kesiangan
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border-2 border-border rounded-2xl shadow-elegant overflow-hidden">
            {/* Live Clock Strip */}
            <div className="bg-gradient-header px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Jam Sekarang</p>
                <span className="text-white font-mono font-bold text-2xl tabular-nums leading-none">{timeStr}</span>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Tanggal</p>
                <p className="text-white/90 text-xs font-medium capitalize">{dateStr}</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Masuk Admin</h3>
                  <p className="text-xs text-muted-foreground">Masukkan kredensial akun admin</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Username
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="email"
                      placeholder="admin@gmail.com"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9 h-11 bg-background border-2 border-input focus:border-primary transition-colors"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 bg-background border-2 border-input focus:border-primary transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full h-11 bg-gradient-header text-white font-bold text-sm shadow-elegant hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Sistem</span>
                    </div>
                  )}
                </Button>

                {!isOnline && (
                  <p className="text-center text-xs text-destructive font-medium">
                    Tidak dapat masuk. Periksa koneksi internet.
                  </p>
                )}
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            &copy; 2026 {SCHOOL_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
