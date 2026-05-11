import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'gold' | 'danger' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-card border-border',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
    title: 'text-muted-foreground',
  },
  primary: {
    card: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    icon: 'bg-primary/15 text-primary',
    value: 'text-primary',
    title: 'text-primary/70',
  },
  gold: {
    card: 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20',
    icon: 'bg-accent/15 text-accent',
    value: 'text-accent',
    title: 'text-accent/70',
  },
  danger: {
    card: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
    icon: 'bg-destructive/15 text-destructive',
    value: 'text-destructive',
    title: 'text-destructive/70',
  },
  warning: {
    card: 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20',
    icon: 'bg-orange-500/15 text-orange-500',
    value: 'text-orange-500',
    title: 'text-orange-500/70',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('rounded-xl border-2 p-4 shadow-card transition-all hover:shadow-elegant', styles.card, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-medium uppercase tracking-wide', styles.title)}>{title}</p>
          <p className={cn('text-3xl font-bold mt-1 tabular-nums', styles.value)}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={cn('flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center', styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
