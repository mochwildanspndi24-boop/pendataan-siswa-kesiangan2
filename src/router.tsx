import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

export const routers = [
  {
    path: '/',
    name: 'login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/attendance',
    name: 'attendance',
    element: <ProtectedRoute><Attendance /></ProtectedRoute>,
  },
  {
    path: '/students',
    name: 'students',
    element: <ProtectedRoute><Students /></ProtectedRoute>,
  },
  {
    path: '/reports',
    name: 'reports',
    element: <ProtectedRoute><Reports /></ProtectedRoute>,
  },
  {
    path: '/statistics',
    name: 'statistics',
    element: <ProtectedRoute><Statistics /></ProtectedRoute>,
  },
  {
    path: '/settings',
    name: 'settings',
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: '*',
    name: '404',
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
