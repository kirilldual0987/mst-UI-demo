import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ConversationScope,
  ToastMessage,
  ToastTone,
} from '../types';

interface NotifyInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface UiContextValue {
  searchOpen: boolean;
  searchScopeChatId?: string;
  openSearch: (chatId?: string) => void;
  closeSearch: () => void;
  newChatOpen: boolean;
  openNewChat: () => void;
  closeNewChat: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  scope: ConversationScope;
  setScope: (scope: ConversationScope) => void;
  toasts: ToastMessage[];
  notify: (input: NotifyInput) => void;
  dismissToast: (id: string) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchScopeChatId, setSearchScopeChatId] = useState<string | undefined>();
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scope, setScope] = useState<ConversationScope>({ type: 'all' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<number[]>([]);

  const notify = useCallback(
    ({ title, description, tone = 'neutral' }: NotifyInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-3), { id, title, description, tone }]);
      const timer = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4400);
      timers.current.push(timer);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const openSearch = useCallback((chatId?: string) => {
    setSearchScopeChatId(chatId);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchScopeChatId(undefined);
  }, []);

  const openNewChat = useCallback(() => setNewChatOpen(true), []);
  const closeNewChat = useCallback(() => setNewChatOpen(false), []);

  const value = useMemo<UiContextValue>(
    () => ({
      searchOpen,
      searchScopeChatId,
      openSearch,
      closeSearch,
      newChatOpen,
      openNewChat,
      closeNewChat,
      mobileNavOpen,
      setMobileNavOpen,
      scope,
      setScope,
      toasts,
      notify,
      dismissToast,
    }),
    [
      searchOpen,
      searchScopeChatId,
      openSearch,
      closeSearch,
      newChatOpen,
      openNewChat,
      closeNewChat,
      mobileNavOpen,
      scope,
      toasts,
      notify,
      dismissToast,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

// Context hooks intentionally live beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useUi(): UiContextValue {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUi must be used within UiProvider');
  return context;
}
