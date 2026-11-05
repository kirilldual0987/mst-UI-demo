import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MessageSquareDashed, SquarePen } from 'lucide-react';
import type { Chat, ChatView } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  filterChats,
  searchChats,
  VIEW_BASE_PATHS,
} from '../../lib/chatFilters';
import { cn } from '../../lib/cn';
import { ChatListPane } from './ChatListPane';
import { ChatPane } from './ChatPane';
import { ChatInfoPanel } from './ChatInfoPanel';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

interface ChatWorkspaceProps {
  view: ChatView;
}

const LIST_MIN = 272;
const LIST_MAX = 424;
const INFO_MIN = 276;
const INFO_MAX = 384;

function storedWidth(key: string, fallback: number, min: number, max: number): number {
  try {
    const value = Number(window.localStorage.getItem(key));
    if (Number.isFinite(value) && value >= min && value <= max) return value;
  } catch {
    // Ignore storage access failures.
  }
  return fallback;
}

export function ChatWorkspace({ view }: ChatWorkspaceProps) {
  const { chatId } = useParams<{ chatId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { chats, accounts, settings } = useApp();
  const { scope, setScope, openNewChat } = useUi();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isWide = useMediaQuery('(min-width: 1280px)');
  const basePath = VIEW_BASE_PATHS[view];

  const [query, setQuery] = useState('');
  const [listOpen, setListOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1280px)').matches && settings.showInfoPanel;
  });
  const [listWidth, setListWidth] = useState(() =>
    storedWidth('messthon.listWidth', 328, LIST_MIN, LIST_MAX),
  );
  const [infoWidth, setInfoWidth] = useState(() =>
    storedWidth('messthon.infoWidth', 304, INFO_MIN, INFO_MAX),
  );
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem('messthon.listWidth', String(listWidth));
  }, [listWidth]);
  useEffect(() => {
    window.localStorage.setItem('messthon.infoWidth', String(infoWidth));
  }, [infoWidth]);
  useEffect(() => {
    if (!settings.showInfoPanel) setInfoOpen(false);
  }, [settings.showInfoPanel]);

  const scopeChats = useMemo(
    () => filterChats(chats, view, scope),
    [chats, view, scope],
  );
  const visibleChats = useMemo(
    () => searchChats(scopeChats, query),
    [scopeChats, query],
  );
  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === chatId),
    [chats, chatId],
  );
  const activeAccount = accounts.find((account) => account.id === activeChat?.accountId);

  useEffect(() => {
    if (!isDesktop) return;
    if (chatId) {
      if (scopeChats.some((chat) => chat.id === chatId)) return;
      navigate(scopeChats[0] ? `${basePath}/${scopeChats[0].id}` : basePath, {
        replace: true,
      });
      return;
    }
    if (scopeChats[0]) {
      navigate(`${basePath}/${scopeChats[0].id}`, { replace: true });
    }
  }, [basePath, chatId, isDesktop, navigate, scopeChats]);

  useEffect(() => {
    setQuery('');
  }, [view]);

  useEffect(() => {
    if (!chatId || activeChat) return;
    if (!isDesktop) navigate(basePath, { replace: true });
  }, [activeChat, basePath, chatId, isDesktop, navigate]);

  const openChat = (chat: Chat) => {
    setInfoOpen(false);
    navigate(`${basePath}/${chat.id}`);
  };

  const backToList = () => {
    setInfoOpen(false);
    navigate(basePath);
  };

  const clearFilters = () => {
    setQuery('');
    setScope({ type: 'all' });
    if (view !== 'all' || !scopeChats.length) navigate('/messages');
  };

  const dragRef = useRef<{
    side: 'list' | 'info';
    startX: number;
    startWidth: number;
  } | null>(null);

  const maxPanelWidth = (side: 'list' | 'info'): number => {
    const workspaceWidth = workspaceRef.current?.clientWidth ?? window.innerWidth;
    const otherWidth =
      (showInfo || infoOpen) && activeChat && side === 'list'
        ? infoWidth
        : side === 'info'
          ? listWidth
          : 0;
    const available = workspaceWidth - otherWidth - 10 - 430;
    return Math.max(side === 'list' ? LIST_MIN : INFO_MIN, Math.min(side === 'list' ? LIST_MAX : INFO_MAX, available));
  };

  const beginResize = (
    side: 'list' | 'info',
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    dragRef.current = {
      side,
      startX: event.clientX,
      startWidth: side === 'list' ? listWidth : infoWidth,
    };
    document.body.classList.add('is-resizing');
    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = moveEvent.clientX - drag.startX;
      if (drag.side === 'list') {
        setListWidth(
          Math.min(maxPanelWidth('list'), Math.max(LIST_MIN, drag.startWidth + delta)),
        );
      } else {
        setInfoWidth(
          Math.min(maxPanelWidth('info'), Math.max(INFO_MIN, drag.startWidth - delta)),
        );
      }
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.classList.remove('is-resizing');
      window.removeEventListener('pointermove', onMove);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const keyboardResize = (
    side: 'list' | 'info',
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.shiftKey ? 32 : 12;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    if (side === 'list') {
      setListWidth((width) =>
        Math.min(maxPanelWidth('list'), Math.max(LIST_MIN, width + direction * step)),
      );
    } else {
      setInfoWidth((width) =>
        Math.min(maxPanelWidth('info'), Math.max(INFO_MIN, width - direction * step)),
      );
    }
  };

  const showList = isDesktop ? listOpen : true;
  const showInfo = infoOpen && Boolean(activeChat);

  const style = {
    '--list-width': `${listWidth}px`,
    '--info-width': `${infoWidth}px`,
  } as CSSProperties;

  return (
    <div
      ref={workspaceRef}
      className={cn(
        'workspace',
        activeChat && 'has-active-chat',
        showList && 'has-list',
        showInfo && 'info-visible',
      )}
      style={style}
      data-list-open={showList ? 'true' : 'false'}
      data-info-open={showInfo ? 'true' : 'false'}
    >
      {showList && (
        <ChatListPane
          view={view}
          chats={visibleChats}
          scopeCount={scopeChats.length}
          query={query}
          onQueryChange={setQuery}
          activeChatId={chatId}
          onOpenChat={openChat}
          onClearFilters={clearFilters}
        />
      )}

      {showList && isWide && (
        <div
          className="resizer resizer--list"
          role="separator"
          aria-orientation="vertical"
          aria-label="Изменить ширину списка переписок"
          aria-valuemin={LIST_MIN}
          aria-valuemax={LIST_MAX}
          aria-valuenow={listWidth}
          tabIndex={0}
          onPointerDown={(event) => beginResize('list', event)}
          onKeyDown={(event) => keyboardResize('list', event)}
        >
          <span />
        </div>
      )}

      <div className="chat-column">
        {activeChat ? (
          <ChatPane
            chat={activeChat}
            account={activeAccount}
            infoOpen={showInfo}
            listOpen={showList}
            highlightMessageId={searchParams.get('message') ?? undefined}
            onBack={backToList}
            onToggleInfo={() => setInfoOpen((value) => !value)}
            onToggleList={() => setListOpen((value) => !value)}
          />
        ) : (
          <div className="chat-empty-pane">
            <EmptyState
              icon={<MessageSquareDashed size={28} />}
              title={
                chatId
                  ? 'Переписка не найдена'
                  : 'Выберите переписку'
              }
              description={
                chatId
                  ? 'Возможно, чат был удалён или скрыт фильтром. Вернитесь к списку переписок.'
                  : 'Откройте существующий чат или начните новый разговор. Все протоколы собраны в одном рабочем пространстве.'
              }
              action={
                <div className="empty-state__actions">
                  <Button
                    variant="tonal"
                    icon={<SquarePen size={16} />}
                    onClick={openNewChat}
                  >
                    Новое сообщение
                  </Button>
                  <Button variant="text" onClick={() => navigate('/messages')}>
                    Все сообщения
                  </Button>
                </div>
              }
            />
            {!showList && (
              <button
                type="button"
                className="text-link chat-empty-pane__show-list"
                onClick={() => setListOpen(true)}
              >
                Показать список переписок
              </button>
            )}
          </div>
        )}
      </div>

      {activeChat && showInfo && !isWide && (
        <button
          type="button"
          className="info-backdrop"
          aria-label="Закрыть панель информации"
          onClick={() => setInfoOpen(false)}
        />
      )}

      {activeChat && showInfo && isWide && (
        <div
          className="resizer resizer--info"
          role="separator"
          aria-orientation="vertical"
          aria-label="Изменить ширину панели информации"
          aria-valuemin={INFO_MIN}
          aria-valuemax={INFO_MAX}
          aria-valuenow={infoWidth}
          tabIndex={0}
          onPointerDown={(event) => beginResize('info', event)}
          onKeyDown={(event) => keyboardResize('info', event)}
        >
          <span />
        </div>
      )}

      {activeChat && showInfo && (
        <ChatInfoPanel chat={activeChat} onClose={() => setInfoOpen(false)} />
      )}
    </div>
  );
}
