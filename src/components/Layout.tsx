import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLiveClock } from '@/hooks/useLiveClock';
import { cn } from '@/lib/utils';

const SCHOOL_NAME = 'SMK DARUL MUTTAQIN CIANJUR';
const LOGO_URL = 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100050100/514a7296-7778-48.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Absen Kesiangan', icon: ClipboardCheck },
  { to: '/students', label: 'Data Siswa', icon: Users },
  { to: '/statistics', label: 'Statistik', icon: BarChart3 },
  { to: '/reports', label: 'Laporan', icon: FileText },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { timeStr, dateStr } = useLiveClock();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'w-64 bg-sidebar transition-transform duration-300',
          'lg:relative lg:translate-x-0 lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo + School Name */}
        <div className="px-4 pt-5 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo SMK"
              className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-md"
              crossOrigin="anonymous"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-foreground leading-tight">{SCHOOL_NAME}</p>
              <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">Sistem Pendataan Kesiangan</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Controls */}
        <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gradient-header px-4 py-3 flex items-center justify-between shadow-elegant flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop school name */}
            <div className="hidden lg:flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white font-bold text-sm leading-none">{SCHOOL_NAME}</p>
                {title && <p className="text-white/70 text-xs mt-0.5">{title}</p>}
              </div>
            </div>
            {/* Mobile title */}
            <div className="lg:hidden">
              <p className="text-white font-bold text-sm">{title || 'Sistem Kesiangan'}</p>
            </div>
          </div>

          {/* Right: Clock */}
          <div className="flex flex-col items-end">
            <span className="text-white font-mono font-bold text-lg tabular-nums">{timeStr}</span>
            <span className="text-white/60 text-[10px] hidden sm:block capitalize">{dateStr}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
