import { ContactRound, Layers3, MessageSquare, Settings2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { countUnread } from '../../lib/chatFilters';
import { cn } from '../../lib/cn';
import { isChatViewPath } from '../../lib/format';

const items = [
  { to: '/messages', label: 'Чаты', icon: MessageSquare, kind: 'chats' },
  { to: '/contacts', label: 'Контакты', icon: ContactRound, kind: 'contacts' },
  { to: '/accounts', label: 'Аккаунты', icon: Layers3, kind: 'accounts' },
  { to: '/settings', label: 'Настройки', icon: Settings2, kind: 'settings' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chats } = useApp();
  const unread = countUnread(chats);

  const isActive = (kind: string) => {
    if (kind === 'chats') return isChatViewPath(location.pathname);
    if (kind === 'contacts') return location.pathname.startsWith('/contacts');
    if (kind === 'accounts') return location.pathname.startsWith('/accounts');
    return location.pathname.startsWith('/settings');
  };

  return (
    <nav className="mobile-nav" aria-label="Мобильная навигация">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.kind);
        return (
          <button
            key={item.kind}
            type="button"
            className={cn('mobile-nav__item', active && 'is-active')}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(item.to)}
          >
            <span className="mobile-nav__icon">
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
              {item.kind === 'chats' && unread > 0 && (
                <span className="mobile-nav__badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
