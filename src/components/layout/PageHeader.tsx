import type { ReactNode } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useUi } from '../../state/UiContext';
import { IconButton } from '../ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  className?: string;
  eyebrow?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
  className,
  eyebrow,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { setMobileNavOpen } = useUi();

  return (
    <header className={cn('page-header', className)}>
      <div className="page-header__leading">
        {backTo ? (
          <IconButton
            label="Назад"
            className="page-header__back"
            onClick={() => navigate(backTo)}
          >
            <ArrowLeft size={19} />
          </IconButton>
        ) : (
          <IconButton
            label="Открыть навигацию"
            className="page-header__menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={20} />
          </IconButton>
        )}
        <div className="page-header__copy">
          {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <div className="page-header__subtitle">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

interface MobileMenuButtonProps {
  className?: string;
}

export function MobileMenuButton({ className }: MobileMenuButtonProps) {
  const { setMobileNavOpen } = useUi();
  return (
    <IconButton
      label="Открыть навигацию"
      className={cn('mobile-menu-button', className)}
      onClick={() => setMobileNavOpen(true)}
    >
      <Menu size={20} />
    </IconButton>
  );
}
