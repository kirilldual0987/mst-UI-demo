import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellOff,
  BellRing,
  CheckCheck,
  Download,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  MessageSquare,
  Pin,
  PinOff,
  RotateCcw,
  Search,
  SearchX,
  SquarePen,
  Star,
  StarOff,
  UserRound,
} from 'lucide-react';
import type { Chat, ChatView } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { VIEW_TITLES } from '../../lib/chatFilters';
import { pluralizeRu, protocolLabel } from '../../lib/format';
import { cn } from '../../lib/cn';
import { SearchField } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ContextMenu, type MenuItem } from '../ui/Menu';
import { ChatRow } from './ChatRow';
import { MobileMenuButton } from '../layout/PageHeader';
import { ProtocolSwitcher } from './ProtocolSwitcher';

interface ChatListPaneProps {
  view: ChatView;
  chats: Chat[];
  scopeCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  activeChatId?: string;
  onOpenChat: (chat: Chat) => void;
  onClearFilters: () => void;
}

function emptyIcon(view: ChatView) {
  if (view === 'favorites') return <Star size={24} />;
  if (view === 'unread') return <Mail size={24} />;
  if (view === 'groups') return <Inbox size={24} />;
  if (view === 'rooms') return <MessageSquare size={24} />;
  return <MessageSquare size={24} />;
}

export function ChatListPane({
  view,
  chats,
  scopeCount,
  query,
  onQueryChange,
  activeChatId,
  onOpenChat,
  onClearFilters,
}: ChatListPaneProps) {
  const {
    accounts,
    contacts,
    markChatRead,
    markChatUnread,
    toggleChatFlag,
    settings,
  } = useApp();
  const { scope, notify, openSearch, openNewChat } = useUi();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextChat, setContextChat] = useState<Chat | null>(null);

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const contactMap = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );

  const activeAccount =
    scope.type === 'account'
      ? accounts.find((account) => account.id === scope.accountId)
      : undefined;

  const scopeSummary = activeAccount
    ? `${activeAccount.displayName} · ${protocolLabel(activeAccount.protocol)}`
    : scope.type === 'protocol'
      ? `Только ${protocolLabel(scope.protocol)} · ${scopeCount} ${pluralizeRu(scopeCount, ['переписка', 'переписки', 'переписок'])}`
      : `${accounts.length} ${pluralizeRu(accounts.length, ['аккаунт', 'аккаунта', 'аккаунтов'])} · ${scopeCount} ${pluralizeRu(scopeCount, ['переписка', 'переписки', 'переписок'])}`;

  const buildMenuItems = (chat: Chat): MenuItem[] => {
    const account = accountMap.get(chat.accountId);
    const items: MenuItem[] = [
      chat.unread
        ? {
            id: 'read',
            label: 'Отметить прочитанным',
            icon: <CheckCheck size={16} />,
            onSelect: () => {
              markChatRead(chat.id);
              notify({
                title: 'Переписка прочитана',
                description: 'Счётчик непрочитанных обновлён.',
                tone: 'success',
              });
            },
          }
        : {
            id: 'unread',
            label: 'Отметить непрочитанным',
            icon: <MailOpen size={16} />,
            onSelect: () => {
              markChatUnread(chat.id);
              notify({
                title: 'Отмечено непрочитанным',
                description: 'Чат появится в разделе «Непрочитанные».',
              });
            },
          },
      {
        id: 'pin',
        label: chat.pinned ? 'Открепить' : 'Закрепить',
        icon: chat.pinned ? <PinOff size={16} /> : <Pin size={16} />,
        onSelect: () => {
          toggleChatFlag(chat.id, 'pinned');
          notify({
            title: chat.pinned ? 'Чат откреплён' : 'Чат закреплён',
            description: chat.name,
            tone: 'success',
          });
        },
      },
      {
        id: 'favorite',
        label: chat.favorite ? 'Убрать из избранного' : 'Добавить в избранное',
        icon: chat.favorite ? <StarOff size={16} /> : <Star size={16} />,
        onSelect: () => {
          toggleChatFlag(chat.id, 'favorite');
          notify({
            title: chat.favorite ? 'Убрано из избранного' : 'Добавлено в избранное',
            description: chat.name,
            tone: 'success',
          });
        },
      },
      {
        id: 'mute',
        label: chat.muted ? 'Включить уведомления' : 'Отключить уведомления',
        icon: chat.muted ? <BellRing size={16} /> : <BellOff size={16} />,
        onSelect: () => {
          toggleChatFlag(chat.id, 'muted');
          notify({
            title: chat.muted ? 'Уведомления включены' : 'Уведомления отключены',
            description: `${chat.name} · ${account?.displayName ?? 'аккаунт'}`,
          });
        },
      },
    ];

    if (chat.kind === 'direct' && chat.contactId) {
      items.push({
        id: 'profile',
        label: 'Открыть профиль',
        icon: <UserRound size={16} />,
        separatorBefore: true,
        onSelect: () => navigate(`/contacts/${chat.contactId}`),
      });
    }
    items.push({
      id: 'export',
      label: 'Экспорт переписки',
      icon: <Download size={16} />,
      onSelect: () =>
        notify({
          title: 'Экспорт переписки',
          description:
            'Демонстрационное действие: файл экспорта будет доступен после подключения адаптера протокола.',
        }),
    });
    if (chat.kind !== 'direct') {
      items.push({
        id: 'leave',
        label: chat.kind === 'space' ? 'Покинуть пространство' : 'Покинуть комнату',
        icon: <LogOut size={16} />,
        danger: true,
        onSelect: () =>
          notify({
            title: 'Действие недоступно в прототипе',
            description: 'Выход из комнаты будет отправлен через протокольный адаптер.',
            tone: 'warning',
          }),
      });
    }
    return items;
  };

  const openContextMenu = (event: MouseEvent<HTMLButtonElement>, chat: Chat) => {
    event.preventDefault();
    setContextChat(chat);
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const empty = chats.length === 0;
  const isFiltered = Boolean(query.trim()) || scope.type !== 'all';

  return (
    <aside className="chat-list-pane" aria-label="Список переписок">
      <div className="chat-list__top">
        <div className="chat-list__title-row">
          <MobileMenuButton className="list-mobile-menu" />
          <div className="chat-list__heading">
            <h1>{VIEW_TITLES[view]}</h1>
            <p>{scopeSummary}</p>
          </div>
          <div className="chat-list__actions">
            <IconButton label="Глобальный поиск" onClick={() => openSearch()}>
              <Search size={18} />
            </IconButton>
            <IconButton label="Новая переписка" variant="tonal" onClick={openNewChat}>
              <SquarePen size={18} />
            </IconButton>
          </div>
        </div>

        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder="Поиск в переписках"
          label="Поиск в списке переписок"
        />

        <ProtocolSwitcher resultCount={scopeCount} />

        {query.trim() && (
          <div className="chat-list__search-note">
            <span>
              Результаты по запросу «{query.trim()}»: {chats.length}
            </span>
            <button type="button" className="text-link" onClick={() => onQueryChange('')}>
              Сбросить
            </button>
          </div>
        )}
      </div>

      <div className="chat-list__scroll" aria-label="Переписки">
        {empty ? (
          <div className="chat-list__empty">
            <EmptyState
              compact
              icon={isFiltered ? <SearchX size={24} /> : emptyIcon(view)}
              title={isFiltered ? 'Ничего не найдено' : 'Здесь пока пусто'}
              description={
                isFiltered
                  ? 'Измените запрос или снимите фильтр по протоколу и аккаунту.'
                  : view === 'favorites'
                    ? 'Добавляйте переписки в избранное, чтобы держать важное под рукой.'
                    : view === 'unread'
                      ? 'Все сообщения прочитаны. Новые появятся здесь автоматически.'
                      : 'В этом разделе пока нет переписок.'
              }
              action={
                <button type="button" className="text-link" onClick={onClearFilters}>
                  {isFiltered ? <RotateCcw size={14} /> : <MessageSquare size={14} />}
                  {isFiltered ? 'Сбросить фильтры' : 'Ко всем сообщениям'}
                </button>
              }
            />
          </div>
        ) : (
          chats.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              account={accountMap.get(chat.accountId)}
              contact={chat.contactId ? contactMap.get(chat.contactId) : undefined}
              active={chat.id === activeChatId}
              menuItems={buildMenuItems(chat)}
              showProtocolLabels={settings.showProtocolLabels}
              showTyping={settings.typingIndicators}
              onClick={() => onOpenChat(chat)}
              onContextMenu={(event) => openContextMenu(event, chat)}
            />
          ))
        )}
      </div>

      <footer className="chat-list__footer">
        <span className={cn('connection-summary', accounts.some((account) => account.status === 'error') && 'has-error')}>
          <span aria-hidden="true" />
          {accounts.filter((account) => account.status === 'connected').length} из{' '}
          {accounts.length} аккаунтов в сети
        </span>
        <span className="chat-list__footer-label">Messthon · unified inbox</span>
      </footer>

      <ContextMenu
        position={contextMenu}
        items={contextChat ? buildMenuItems(contextChat) : []}
        label={`Действия с чатом ${contextChat?.name ?? ''}`}
        onClose={() => {
          setContextMenu(null);
          setContextChat(null);
        }}
      />
    </aside>
  );
}
