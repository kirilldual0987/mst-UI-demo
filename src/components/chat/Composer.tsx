import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import {
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Mic,
  Paperclip,
  Plus,
  SendHorizontal,
  Smile,
  SmilePlus,
  Vote,
  X,
} from 'lucide-react';
import type {
  Account,
  Chat,
  ChatMessage,
  MessageAttachment,
  MessageReply,
} from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import { formatFileSize } from '../../lib/format';
import { ProtocolBadge } from '../ui/Badge';
import { ActionMenu, type MenuItem } from '../ui/Menu';
import { IconButton } from '../ui/Button';

const EMOJIS = [
  '🙂', '😄', '😊', '🤔', '😅', '😍', '🙌', '👏',
  '👍', '👌', '✌️', '🤝', '💚', '🔥', '✨', '🎉',
  '👀', '💬', '📎', '✅', '⚡', '🌿', '☕', '🚀',
];

interface ComposerProps {
  chat: Chat;
  account?: Account;
  reply: ChatMessage | null;
  onCancelReply: () => void;
  disabled: boolean;
  onSend: (payload: {
    text?: string;
    attachment?: MessageAttachment;
    reply?: MessageReply;
  }) => void;
}

export function Composer({
  chat,
  account,
  reply,
  onCancelReply,
  disabled,
  onSend,
}: ComposerProps) {
  const { settings } = useApp();
  const { notify } = useUi();
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft('');
    setEmojiOpen(false);
    setUploading(false);
  }, [chat.id]);

  useEffect(() => {
    if (reply) textareaRef.current?.focus();
  }, [reply]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [draft]);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (event: globalThis.MouseEvent) => {
      if (!emojiRef.current?.contains(event.target as Node)) setEmojiOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setEmojiOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [emojiOpen]);

  const canSend = draft.trim().length > 0 && !disabled && !uploading;

  const sendText = () => {
    if (!canSend) return;
    onSend({
      text: draft.trim(),
      reply: reply
        ? { author: reply.senderName, text: reply.text ?? reply.attachment?.name ?? 'Вложение' }
        : undefined,
    });
    setDraft('');
    onCancelReply();
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const sendCombo =
      event.key === 'Enter' &&
      !event.shiftKey &&
      (settings.enterToSend
        ? !event.altKey && !event.metaKey && !event.ctrlKey
        : event.metaKey || event.ctrlKey);
    if (sendCombo) {
      event.preventDefault();
      sendText();
    }
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify({
        title: 'Не удалось прикрепить файл',
        description: 'Выберите изображение в формате PNG, JPEG или WebP.',
        tone: 'error',
      });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify({
        title: 'Изображение слишком большое',
        description: 'Максимальный размер в прототипе — 8 МБ.',
        tone: 'warning',
      });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      window.setTimeout(() => {
        onSend({
          text: draft.trim() || undefined,
          attachment: {
            type: 'image',
            name: file.name,
            url: String(reader.result),
            size: formatFileSize(file.size),
            meta: 'Изображение',
            alt: file.name,
          },
          reply: reply
            ? { author: reply.senderName, text: reply.text ?? 'Вложение' }
            : undefined,
        });
        setUploading(false);
        setDraft('');
        onCancelReply();
        notify({
          title: 'Изображение отправлено',
          description: 'Файл добавлен в демонстрационную переписку.',
          tone: 'success',
        });
      }, 500);
    };
    reader.onerror = () => {
      setUploading(false);
      notify({
        title: 'Ошибка загрузки',
        description: 'Не удалось прочитать изображение.',
        tone: 'error',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      notify({
        title: 'Файл слишком большой',
        description: 'Максимальный размер вложения в прототипе — 20 МБ.',
        tone: 'warning',
      });
      return;
    }
    const extension = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
    const objectUrl = URL.createObjectURL(file);
    onSend({
      text: draft.trim() || undefined,
      attachment: {
        type: 'file',
        name: file.name,
        url: objectUrl,
        size: formatFileSize(file.size),
        meta: extension,
      },
      reply: reply
        ? { author: reply.senderName, text: reply.text ?? 'Вложение' }
        : undefined,
    });
    setDraft('');
    onCancelReply();
    notify({
      title: 'Файл прикреплён',
      description: 'Файл добавлен в демонстрационную переписку.',
      tone: 'success',
    });
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraft((value) => `${value}${emoji}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setDraft((value) => `${value.slice(0, start)}${emoji}${value.slice(end)}`);
    setEmojiOpen(false);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const attachItems: MenuItem[] = [
    {
      id: 'photo',
      label: 'Изображение',
      icon: <ImagePlus size={16} />,
      onSelect: () => imageInputRef.current?.click(),
    },
    {
      id: 'file',
      label: 'Файл',
      icon: <FileText size={16} />,
      onSelect: () => fileInputRef.current?.click(),
    },
    {
      id: 'location',
      label: 'Геопозиция',
      icon: <MapPin size={16} />,
      separatorBefore: true,
      onSelect: () =>
        notify({
          title: 'Геопозиция',
          description: 'Вложение геопозиции появится после интеграции карт.',
        }),
    },
  ];

  const moreItems: MenuItem[] = [
    {
      id: 'poll',
      label: 'Создать опрос',
      icon: <Vote size={16} />,
      onSelect: () =>
        notify({
          title: 'Опросы',
          description: 'Создание опросов станет доступно в следующей версии.',
        }),
    },
    {
      id: 'voice',
      label: 'Голосовое сообщение',
      icon: <Mic size={16} />,
      onSelect: () =>
        notify({
          title: 'Голосовые сообщения',
          description: 'Запись аудио появится после подключения медиа-модуля.',
        }),
    },
    {
      id: 'sticker',
      label: 'Стикер',
      icon: <SmilePlus size={16} />,
      onSelect: () =>
        notify({
          title: 'Стикеры',
          description: 'Библиотека стикеров будет общей для всех протоколов.',
        }),
    },
  ];

  return (
    <div className="composer-area">
      {reply && (
        <div className="composer-reply">
          <span className="composer-reply__bar" aria-hidden="true" />
          <div className="composer-reply__copy">
            <strong>{reply.senderName}</strong>
            <span>{reply.text ?? reply.attachment?.name ?? 'Вложение'}</span>
          </div>
          <IconButton label="Отменить ответ" size="sm" onClick={onCancelReply}>
            <X size={15} />
          </IconButton>
        </div>
      )}

      {uploading && (
        <div className="composer-upload" role="status">
          <LoaderCircle size={15} className="spin" />
          Обрабатываем изображение…
        </div>
      )}

      <div className={cn('composer', disabled && 'composer--disabled')}>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleImage}
          aria-label="Прикрепить изображение"
          tabIndex={-1}
        />
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFile}
          aria-label="Прикрепить файл"
          tabIndex={-1}
        />

        <div className="composer__tools">
          <ActionMenu
            items={attachItems}
            label="Прикрепить"
            triggerIcon={<Paperclip size={19} />}
            align="start"
          />
          <IconButton
            label="Прикрепить изображение"
            className="composer__secondary-tool"
            disabled={disabled}
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus size={19} />
          </IconButton>
        </div>

        <textarea
          ref={textareaRef}
          className="composer__input"
          value={draft}
          rows={1}
          placeholder={
            disabled ? 'Аккаунт недоступен — отправка приостановлена' : 'Сообщение'
          }
          aria-label={`Сообщение в чат ${chat.name}`}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="composer__actions">
          <div className="emoji-anchor" ref={emojiRef}>
            <IconButton
              label="Эмодзи"
              disabled={disabled}
              onClick={() => setEmojiOpen((value) => !value)}
              aria-expanded={emojiOpen}
            >
              <Smile size={19} />
            </IconButton>
            {emojiOpen && (
              <div className="emoji-picker" role="dialog" aria-label="Выбор эмодзи">
                <div className="emoji-picker__header">
                  <strong>Часто используемые</strong>
                  <button type="button" className="text-link" onClick={() => setEmojiOpen(false)}>
                    Закрыть
                  </button>
                </div>
                <div className="emoji-picker__grid">
                  {EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      aria-label={`Вставить ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ActionMenu
            items={moreItems}
            label="Дополнительные действия"
            triggerIcon={<Plus size={19} />}
            className="composer__more"
          />
          <button
            type="button"
            className="send-button"
            disabled={!canSend}
            aria-label="Отправить сообщение"
            title="Отправить сообщение"
            onClick={sendText}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="composer__context">
        <span>
          <ProtocolBadge protocol={chat.protocol} />
          <span className="composer__account">
            через {account?.handle ?? 'неизвестный аккаунт'}
          </span>
        </span>
        <span className="composer__hint">
          {disabled
            ? 'Соединение с аккаунтом потеряно'
            : settings.enterToSend
              ? 'Enter — отправить · Shift+Enter — новая строка'
              : '⌘Enter — отправить'}
        </span>
      </div>
    </div>
  );
}
