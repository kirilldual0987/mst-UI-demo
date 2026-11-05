import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BellOff,
  BellRing,
  CheckCheck,
  ChevronRight,
  Copy,
  Download,
  Info,
  LoaderCircle,
  LockKeyhole,
  MailOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Pin,
  PinOff,
  RotateCw,
  Search,
  Star,
  UserRound,
  Video,
  WifiOff,
} from 'lucide-react';
import type { Account, Chat, ChatMessage, MessageAttachment, MessageReply } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import {
  chatKindLabel,
  pluralizeRu,
  presenceLabel,
  protocolLabel,
} from '../../lib/format';
import { Avatar } from '../ui/Avatar';
import { ProtocolBadge } from '../ui/Badge';
import { Button, IconButton } from '../ui/Button';
import { ActionMenu, type MenuItem } from '../ui/Menu';
import { MessageList } from './MessageList';
import { Composer } from './Composer';

interface ChatPaneProps {
  chat: Chat;
  account?: Account;
  infoOpen: boolean;
  listOpen: boolean;
  highlightMessageId?: string;
  onBack: () => void;
  onToggleInfo: () => void;
  onToggleList: () => void;
}

export function ChatPane({
  chat,
  account,
  infoOpen,
  listOpen,
  highlightMessageId,
  onBack,
  onToggleInfo,
  onToggleList,
}: ChatPaneProps) {
  const {
    contacts,
    messages,
    settings,
    markChatRead,
    markChatUnread,
    toggleChatFlag,
    sendMessage,
    setAccountStatus,
  } = useApp();
  const { notify, openSearch } = useUi();
  const navigate = useNavigate();
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    setReply(null);
    setReconnecting(false);
    document.title = `${chat.name} — Messthon`;
    return () => {
      document.title = 'Messthon — мультипротокольный мессенджер';
    };
  }, [chat.id, chat.name]);

  const chatMessages = useMemo(
    () =>
      messages
        .filter((message) => message.chatId === chat.id)
        .sort(
          (left, right) =>
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
        ),
    [messages, chat.id],
  );

  const contact = contacts.find((item) => item.id === chat.contactId);
  const isDirect = chat.kind === 'direct';
  const accountAvailable = account?.status === 'connected';
  const connectionIssue = account && account.status !== 'connected';

  const retryConnection = () => {
    if (!account || reconnecting) return;
    setReconnecting(true);
    setAccountStatus(account.id, 'syncing', 'Подключение…');
    notify({
      title: 'Переподключение',
      description: `Устанавливаем соединение с ${account.server}…`,
    });
    window.setTimeout(() => {
      setAccountStatus(account.id, 'connected', 'только что');
      setReconnecting(false);
      notify({
        title: 'Соединение восстановлено',
        description: `${account.displayName} снова синхронизируется.`,
        tone: 'success',
      });
    }, 1700);
  };

  const send = (payload: {
    text?: string;
    attachment?: MessageAttachment;
    reply?: MessageReply;
  }) => {
    if (!accountAvailable) {
      notify({
        title: 'Сообщение не отправлено',
        description: 'Восстановите соединение с аккаунтом и повторите попытку.',
        tone: 'error',
      });
      return;
    }
    sendMessage({
      chatId: chat.id,
      text: payload.text,
      attachment: payload.attachment,
      reply: payload.reply,
    });
    setReply(null);
  };

  const copyIdentifier = async () => {
    const value =
      contact?.handle ?? `${chat.id}:${account?.server ?? 'messthon.chat'}`;
    try {
      await navigator.clipboard.writeText(value);
      notify({ title: 'Идентификатор скопирован', description: value, tone: 'success' });
    } catch {
      notify({
        title: 'Не удалось скопировать',
        description: 'Буфер обмена недоступен в этом браузере.',
        tone: 'error',
      });
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'read',
      label: chat.unread ? 'Отметить прочитанным' : 'Отметить непрочитанным',
      icon: chat.unread ? <CheckCheck size={16} /> : <MailOpen size={16} />,
      onSelect: () => {
        if (chat.unread) {
          markChatRead(chat.id);
          notify({ title: 'Переписка прочитана', tone: 'success' });
        } else {
          markChatUnread(chat.id);
          notify({ title: 'Чат отмечен непрочитанным' });
        }
      },
    },
    {
      id: 'pin',
      label: chat.pinned ? 'Открепить чат' : 'Закрепить чат',
      icon: chat.pinned ? <PinOff size={16} /> : <Pin size={16} />,
      onSelect: () => {
        toggleChatFlag(chat.id, 'pinned');
        notify({
          title: chat.pinned ? 'Чат откреплён' : 'Чат закреплён',
          tone: 'success',
        });
      },
    },
    {
      id: 'favorite',
      label: chat.favorite ? 'Убрать из избранного' : 'Добавить в избранное',
      icon: <Star size={16} />,
      onSelect: () => {
        toggleChatFlag(chat.id, 'favorite');
        notify({
          title: chat.favorite ? 'Убрано из избранного' : 'Добавлено в избранное',
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
          tone: 'success',
        });
      },
    },
    {
      id: 'copy',
      label: 'Скопировать идентификатор',
      icon: <Copy size={16} />,
      separatorBefore: true,
      onSelect: copyIdentifier,
    },
    {
      id: 'export',
      label: 'Экспорт переписки',
      icon: <Download size={16} />,
      onSelect: () =>
        notify({
          title: 'Экспорт переписки',
          description: 'Доступен после подключения реального адаптера протокола.',
        }),
    },
    ...(isDirect && contact
      ? [
          {
            id: 'profile',
            label: 'Профиль контакта',
            icon: <UserRound size={16} />,
            onSelect: () => navigate(`/contacts/${contact.id}`),
          } satisfies MenuItem,
        ]
      : []),
    {
      id: 'security',
      label: 'Безопасность',
      icon: <LockKeyhole size={16} />,
      onSelect: onToggleInfo,
    },
  ];

  const statusLine = isDirect
    ? contact
      ? `${presenceLabel(contact.presence)} · ${account?.shortName ?? protocolLabel(chat.protocol)}`
      : protocolLabel(chat.protocol)
    : `${chatKindLabel(chat.kind)} · ${chat.memberCount ?? 1} ${pluralizeRu(
        chat.memberCount ?? 1,
        ['участник', 'участника', 'участников'],
      )}`;

  return (
    <section className="chat-pane" aria-label={`Переписка ${chat.name}`}>
      <header className="chat-header">
        <div className="chat-header__leading">
          <IconButton label="Назад к перепискам" className="chat-header__back" onClick={onBack}>
            <ArrowLeft size={20} />
          </IconButton>
          <IconButton
            label={listOpen ? 'Скрыть список переписок' : 'Показать список переписок'}
            className="chat-header__panel-toggle"
            onClick={onToggleList}
          >
            {listOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
          </IconButton>
          <button
            type="button"
            className="chat-header__identity"
            onClick={onToggleInfo}
            title="Информация о чате"
          >
            <Avatar
              name={chat.name}
              tone={chat.tone}
              size={40}
              kind={chat.kind}
              presence={contact?.presence}
            />
            <span className="chat-header__copy">
              <span className="chat-header__name-row">
                <strong>{chat.name}</strong>
                {chat.encrypted && (
                  <LockKeyhole
                    size={13}
                    className="chat-header__lock"
                    aria-label="Сквозное шифрование"
                  />
                )}
              </span>
              <span className="chat-header__status-row">
                <span className={cn('chat-header__status', isDirect && contact?.presence === 'online' && 'is-online')}>
                  {statusLine}
                </span>
                <ProtocolBadge protocol={chat.protocol} compact={!settings.showProtocolLabels} />
              </span>
            </span>
          </button>
        </div>

        <div className="chat-header__actions">
          <IconButton label="Поиск в чате" onClick={() => openSearch(chat.id)}>
            <Search size={19} />
          </IconButton>
          <IconButton
            label="Позвонить"
            className="chat-header__call"
            onClick={() =>
              notify({
                title: 'Звонки',
                description:
                  'Аудиозвонки появятся после подключения медиа-шлюза выбранного протокола.',
              })
            }
          >
            <Phone size={19} />
          </IconButton>
          <IconButton
            label="Видеозвонок"
            className="chat-header__call"
            onClick={() =>
              notify({
                title: 'Видеозвонки',
                description:
                  'Видеозвонки появятся после подключения медиа-шлюза выбранного протокола.',
              })
            }
          >
            <Video size={19} />
          </IconButton>
          <IconButton
            label={infoOpen ? 'Скрыть информацию' : 'Показать информацию'}
            active={infoOpen}
            onClick={onToggleInfo}
          >
            <Info size={19} />
          </IconButton>
          <ActionMenu items={menuItems} label="Действия с чатом" />
        </div>
      </header>

      {connectionIssue && (
        <div
          className={cn(
            'connection-banner',
            account.status === 'error' && 'connection-banner--error',
            account.status === 'syncing' && 'connection-banner--syncing',
          )}
          role="status"
        >
          <span className="connection-banner__icon">
            {account.status === 'syncing' ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <WifiOff size={18} />
            )}
          </span>
          <div className="connection-banner__copy">
            <strong>
              {account.status === 'syncing'
                ? 'Синхронизация аккаунта'
                : account.status === 'disconnected'
                  ? 'Аккаунт отключён'
                  : 'Соединение потеряно'}
            </strong>
            <span>
              {account.displayName} · {account.statusDetail}
            </span>
          </div>
          {account.status !== 'syncing' && (
            <Button
              variant="tonal"
              size="sm"
              icon={<RotateCw size={15} />}
              loading={reconnecting}
              onClick={retryConnection}
            >
              Переподключить
            </Button>
          )}
          <button
            type="button"
            className="connection-banner__settings"
            onClick={() => navigate('/accounts')}
          >
            Аккаунты
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <MessageList
        chat={chat}
        messages={chatMessages}
        account={account}
        contacts={contacts}
        highlightMessageId={highlightMessageId}
        onReply={setReply}
      />

      <Composer
        chat={chat}
        account={account}
        reply={reply}
        onCancelReply={() => setReply(null)}
        disabled={!accountAvailable}
        onSend={send}
      />
    </section>
  );
}
