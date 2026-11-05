import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  Check,
  CheckCheck,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  FileText,
  Forward,
  Info,
  Reply,
  SmilePlus,
  Trash2,
} from 'lucide-react';
import type {
  Account,
  Chat,
  ChatMessage,
  Contact,
  MessageStatus,
} from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import { formatMessageTime } from '../../lib/format';
import { Avatar } from '../ui/Avatar';
import { ActionMenu, ContextMenu, type MenuItem } from '../ui/Menu';
import { Modal } from '../ui/Modal';

const REACTION_OPTIONS = ['👍', '❤️', '🔥', '🎉', '👀', '✅'];

interface MessageBubbleProps {
  message: ChatMessage;
  chat: Chat;
  account?: Account;
  contact?: Contact;
  showAvatar: boolean;
  showSender: boolean;
  continuation: boolean;
  highlight?: boolean;
  onReply: (message: ChatMessage) => void;
}

function DeliveryStatus({
  status,
  supportsReceipts,
}: {
  status?: MessageStatus;
  supportsReceipts: boolean;
}) {
  if (!status) return null;
  if (status === 'sending') {
    return (
      <span className="delivery-status" title="Отправка">
        <Clock3 size={13} />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="delivery-status delivery-status--error" title="Не отправлено">
        <CircleAlert size={13} />
      </span>
    );
  }
  if (status === 'read' && supportsReceipts) {
    return (
      <span className="delivery-status delivery-status--read" title="Прочитано">
        <CheckCheck size={14} />
      </span>
    );
  }
  if (status === 'delivered' && supportsReceipts) {
    return (
      <span className="delivery-status" title="Доставлено">
        <CheckCheck size={14} />
      </span>
    );
  }
  return (
    <span
      className="delivery-status"
      title={
        supportsReceipts
          ? status === 'sent'
            ? 'Отправлено'
            : 'Доставлено'
          : 'Доставлено · квитанции о прочтении не поддерживаются'
      }
    >
      <Check size={14} />
    </span>
  );
}

export function MessageBubble({
  message,
  chat,
  account,
  contact,
  showAvatar,
  showSender,
  continuation,
  highlight = false,
  onReply,
}: MessageBubbleProps) {
  const { toggleReaction } = useApp();
  const { notify } = useUi();
  const [reactionOpen, setReactionOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reactionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reactionOpen) return;
    const close = (event: MouseEvent | globalThis.MouseEvent) => {
      if (!reactionRef.current?.contains(event.target as Node)) setReactionOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setReactionOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', key);
    };
  }, [reactionOpen]);

  const copyText = async () => {
    const value = message.text ?? message.attachment?.name;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notify({
        title: 'Скопировано',
        description: 'Текст сообщения в буфере обмена.',
        tone: 'success',
      });
    } catch {
      notify({
        title: 'Не удалось скопировать',
        description: 'Браузер ограничил доступ к буферу обмена.',
        tone: 'error',
      });
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'reply',
      label: 'Ответить',
      icon: <Reply size={16} />,
      onSelect: () => onReply(message),
    },
    {
      id: 'react',
      label: 'Добавить реакцию',
      icon: <SmilePlus size={16} />,
      onSelect: () => setReactionOpen(true),
    },
    {
      id: 'copy',
      label: 'Копировать текст',
      icon: <Copy size={16} />,
      onSelect: copyText,
      disabled: !message.text && !message.attachment,
    },
    {
      id: 'forward',
      label: 'Переслать',
      icon: <Forward size={16} />,
      separatorBefore: true,
      onSelect: () =>
        notify({
          title: 'Пересылка сообщения',
          description:
            'Действие станет доступно после подключения протокольных адаптеров.',
        }),
    },
    {
      id: 'delete',
      label: 'Удалить у себя',
      icon: <Trash2 size={16} />,
      danger: true,
      onSelect: () =>
        notify({
          title: 'Удаление сообщения',
          description: 'В демонстрационном режиме история не изменяется.',
        }),
    },
  ];

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  if (message.system) {
    return (
      <div className="system-message" role="note">
        <Info size={14} aria-hidden="true" />
        <span>{message.text}</span>
      </div>
    );
  }

  const file = message.attachment?.type === 'file' ? message.attachment : undefined;
  const image = message.attachment?.type === 'image' ? message.attachment : undefined;
  const supportsReceipts = account?.readReceipts ?? false;

  const downloadFile = () => {
    if (!file?.url) {
      notify({
        title: 'Демонстрационное вложение',
        description: 'Файл доступен только в полной версии Messthon.',
        tone: 'warning',
      });
    }
  };

  return (
    <div
      className={cn(
        'message-row',
        message.outgoing ? 'message-row--outgoing' : 'message-row--incoming',
        continuation && 'is-continuation',
        highlight && 'is-highlighted',
      )}
      data-message-id={message.id}
      onContextMenu={handleContextMenu}
    >
      {!message.outgoing && (
        <div className="message-row__avatar">
          {showAvatar ? (
            <Avatar
              name={message.senderName}
              tone={contact?.tone ?? 0}
              size={30}
              presence={chat.kind === 'direct' ? contact?.presence : undefined}
            />
          ) : (
            <span className="message-row__avatar-spacer" />
          )}
        </div>
      )}

      <div className="message-row__content">
        {showSender && (
          <span className="message-sender">
            {message.senderName}
            {contact?.presence === 'online' && (
              <span className="message-sender__online">online</span>
            )}
          </span>
        )}
        <div className={cn('message-bubble', image && 'message-bubble--media')}>
          {message.reply && (
            <div className="message-reply-preview">
              <strong>{message.reply.author}</strong>
              <span>{message.reply.text}</span>
            </div>
          )}

          {image && (
            <button
              type="button"
              className="message-image"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Открыть изображение ${image.alt ?? image.name}`}
            >
              <img src={image.url} alt={image.alt ?? image.name} loading="lazy" />
            </button>
          )}

          {file && (
            <div className="file-attachment">
              <span className="file-attachment__icon">
                <FileText size={20} />
              </span>
              <span className="file-attachment__copy">
                <strong>{file.name}</strong>
                <span>
                  {file.meta}
                  {file.size ? ` · ${file.size}` : ''}
                </span>
              </span>
              {file.url ? (
                <a
                  className="file-attachment__action"
                  href={file.url}
                  download
                  aria-label={`Скачать ${file.name}`}
                  title="Скачать файл"
                >
                  <Download size={17} />
                </a>
              ) : (
                <button
                  type="button"
                  className="file-attachment__action"
                  onClick={downloadFile}
                  aria-label={`Скачать ${file.name}`}
                  title="Демонстрационное вложение"
                >
                  <Download size={17} />
                </button>
              )}
            </div>
          )}

          {message.text && <p className="message-text">{message.text}</p>}

          <div className="message-meta">
            {message.edited && <span className="message-edited">изм.</span>}
            <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
            {message.outgoing && (
              <DeliveryStatus
                status={message.status}
                supportsReceipts={supportsReceipts}
              />
            )}
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions">
            {message.reactions.map((reaction) => (
              <button
                type="button"
                key={reaction.emoji}
                className={cn('reaction-chip', reaction.mine && 'is-mine')}
                onClick={() => toggleReaction(message.id, reaction.emoji)}
                aria-label={`Реакция ${reaction.emoji}, ${reaction.count}. ${
                  reaction.mine ? 'Убрать' : 'Добавить'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
            <button
              type="button"
              className="reaction-add"
              aria-label="Добавить реакцию"
              onClick={() => setReactionOpen((value) => !value)}
            >
              <SmilePlus size={13} />
            </button>
          </div>
        )}

        <div className="message-actions">
          <button
            type="button"
            className="message-action"
            aria-label="Ответить на сообщение"
            title="Ответить"
            onClick={() => onReply(message)}
          >
            <Reply size={14} />
          </button>
          <div className="reaction-anchor" ref={reactionRef}>
            <button
              type="button"
              className="message-action"
              aria-label="Добавить реакцию"
              title="Добавить реакцию"
              onClick={() => setReactionOpen((value) => !value)}
            >
              <SmilePlus size={14} />
            </button>
            {reactionOpen && (
              <div className="reaction-picker" role="menu" aria-label="Выберите реакцию">
                {REACTION_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    role="menuitem"
                    onClick={() => {
                      toggleReaction(message.id, emoji);
                      setReactionOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ActionMenu
            items={menuItems}
            label="Действия с сообщением"
            buttonClassName="message-action-menu"
            size="sm"
          />
        </div>
      </div>

      <ContextMenu
        position={contextMenu}
        items={menuItems}
        label="Действия с сообщением"
        onClose={() => setContextMenu(null)}
      />

      {image && (
        <Modal
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          title={image.alt ?? image.name}
          size="lg"
          className="image-lightbox"
        >
          <img src={image.url} alt={image.alt ?? image.name} className="image-lightbox__img" />
          <p className="image-lightbox__meta">
            {image.name}
            {image.meta ? ` · ${image.meta}` : ''}
          </p>
        </Modal>
      )}
    </div>
  );
}
