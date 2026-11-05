import {
  AtSign,
  ContactRound,
  Hash,
  Layers3,
  Mail,
  MessageSquare,
  MessagesSquare,
  Moon,
  Settings2,
  SquarePen,
  Star,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import { countUnread } from '../../lib/chatFilters';
import { pluralizeRu } from '../../lib/format';
import { currentUser } from '../../data/demo';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/Button';
import { Logo } from '../brand/Logo';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  match: (pathname: string) => boolean;
}

interface SidebarProps {
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
}

export function Sidebar({ variant = 'desktop', onNavigate }: SidebarProps) {
  const { chats, accounts, updateSettings, resolvedTheme } = useApp();
  const { openSearch, openNewChat } = useUi();
  const navigate = useNavigate();
  const location = useLocation();
  const unread = countUnread(chats);
  const accountCount = accounts.length;
  const hasAccountError = accounts.some(
    (account) => account.status === 'error' || account.status === 'disconnected',
  );

  const primary: NavItem[] = [
    {
      to: '/messages',
      label: 'Все сообщения',
      icon: MessagesSquare,
      badge: unread,
      match: (path) => path === '/messages' || path.startsWith('/messages/'),
    },
    {
      to: '/direct',
      label: 'Личные сообщения',
      icon: MessageSquare,
      match: (path) => path === '/direct' || path.startsWith('/direct/'),
    },
    {
      to: '/groups',
      label: 'Групповые чаты',
      icon: Users,
      match: (path) => path === '/groups' || path.startsWith('/groups/'),
    },
    {
      to: '/rooms',
      label: 'Комнаты и сообщества',
      icon: Hash,
      match: (path) => path === '/rooms' || path.startsWith('/rooms/'),
    },
  ];

  const secondary: NavItem[] = [
    {
      to: '/contacts',
      label: 'Контакты',
      icon: ContactRound,
      match: (path) => path.startsWith('/contacts'),
    },
    {
      to: '/favorites',
      label: 'Избранное',
      icon: Star,
      match: (path) => path.startsWith('/favorites'),
    },
    {
      to: '/unread',
      label: 'Непрочитанные',
      icon: Mail,
      badge: unread,
      match: (path) => path.startsWith('/unread'),
    },
    {
      to: '/accounts',
      label: 'Аккаунты',
      icon: Layers3,
      badge: accountCount,
      match: (path) => path.startsWith('/accounts'),
    },
  ];

  const go = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = item.match(location.pathname);
    const Icon = item.icon;
    return (
      <button
        type="button"
        className={cn('nav-item', active && 'is-active')}
        aria-current={active ? 'page' : undefined}
        title={item.label}
        onClick={() => go(item.to)}
      >
        <span className="nav-item__icon">
          <Icon size={19} strokeWidth={active ? 2.15 : 1.85} />
        </span>
        <span className="nav-item__label">{item.label}</span>
        {item.badge ? (
          <span className="nav-item__badge" aria-label={`${item.badge} непрочитанных`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <aside
      className={cn('sidebar', `sidebar--${variant}`)}
      aria-label="Основная навигация Messthon"
    >
      <div className="sidebar__brand">
        <Logo />
      </div>

      <div className="sidebar__compose">
        <button
          type="button"
          className="compose-button"
          onClick={() => {
            openNewChat();
            onNavigate?.();
          }}
        >
          <SquarePen size={18} />
          <span>Написать</span>
        </button>
      </div>

      <button
        type="button"
        className="sidebar-search"
        onClick={() => {
          openSearch();
          onNavigate?.();
        }}
      >
        <span className="sidebar-search__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="8.6" cy="8.6" r="5.1" stroke="currentColor" strokeWidth="1.7" />
            <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className="sidebar-search__label">Поиск в Messthon</span>
        <kbd>⌘K</kbd>
      </button>

      <nav className="sidebar__nav" aria-label="Разделы">
        <div className="nav-group">
          <span className="nav-group__label">Сообщения</span>
          {primary.map((item) => (
            <NavButton item={item} key={item.to} />
          ))}
        </div>
        <div className="nav-group">
          <span className="nav-group__label">Библиотека</span>
          {secondary.map((item) => (
            <NavButton item={item} key={item.to} />
          ))}
        </div>
      </nav>

      <div className="sidebar__bottom">
        <button type="button" className="account-summary" onClick={() => go('/accounts')}>
          <span className="account-summary__avatars" aria-hidden="true">
            {accounts.slice(0, 3).map((account) => (
              <Avatar
                key={account.id}
                name={account.displayName}
                tone={account.tone}
                size={25}
                protocol={account.protocol}
              />
            ))}
            {accountCount > 3 && (
              <span className="account-summary__more">+{accountCount - 3}</span>
            )}
          </span>
          <span className="account-summary__copy">
            <strong>
              {accountCount} {pluralizeRu(accountCount, ['аккаунт', 'аккаунта', 'аккаунтов'])}
            </strong>
            <span className={hasAccountError ? 'has-warning' : ''}>
              {hasAccountError ? 'Требуется внимание' : 'Все синхронизированы'}
            </span>
          </span>
          <span
            className={cn('account-summary__health', hasAccountError && 'is-warning')}
            aria-hidden="true"
          />
        </button>

        <div className="sidebar__utility">
          <button
            type="button"
            className="nav-item nav-item--settings"
            onClick={() => go('/settings')}
            aria-current={location.pathname.startsWith('/settings') ? 'page' : undefined}
            title="Настройки"
          >
            <span className="nav-item__icon">
              <Settings2 size={19} />
            </span>
            <span className="nav-item__label">Настройки</span>
          </button>
          <IconButton
            label={resolvedTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            onClick={() =>
              updateSettings({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' })
            }
            className="sidebar__theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </div>

        <button
          type="button"
          className="sidebar-profile"
          onClick={() => go('/settings/appearance')}
          title="Открыть настройки профиля и внешнего вида"
        >
          <Avatar name={currentUser.name} tone={currentUser.tone} size={34} />
          <span className="sidebar-profile__copy">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.handle}</span>
          </span>
          <AtSign size={15} className="sidebar-profile__mark" aria-hidden="true" />
        </button>

        <div className="sidebar__protocol-note">
          <span className="protocol-stack" aria-hidden="true">
            <span className="protocol-glyph protocol-glyph--matrix">
              <svg viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
                <rect x="7.3" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
                <rect x="1.5" y="7.3" width="3.2" height="3.2" rx=".8" fill="currentColor" />
                <rect x="7.3" y="7.3" width="3.2" height="3.2" rx=".8" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </span>
            <span className="protocol-glyph protocol-glyph--xmpp">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M6.8 1.3 2.4 6.7h2.9l-.5 4 4.8-5.6H6.5l.3-3.8Z" fill="currentColor" />
              </svg>
            </span>
          </span>
          <span>Matrix + XMPP</span>
          <span className="sidebar__version">v0.1</span>
        </div>
      </div>
    </aside>
  );
}

