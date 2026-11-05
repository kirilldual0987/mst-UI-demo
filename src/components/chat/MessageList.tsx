import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCheck, MessageSquareDashed } from 'lucide-react';
import type { Account, Chat, ChatMessage, Contact } from '../../types';
import { useApp } from '../../state/AppContext';
import {
  dayKey,
  formatDayLabel,
  pluralizeRu,
} from '../../lib/format';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  chat: Chat;
  messages: ChatMessage[];
  account?: Account;
  contacts: Contact[];
  highlightMessageId?: string;
  onReply: (message: ChatMessage) => void;
}

function sameGroup(previous: ChatMessage, current: ChatMessage): boolean {
  if (previous.system || current.system) return false;
  if (previous.senderId !== current.senderId) return false;
  if (previous.outgoing !== current.outgoing) return false;
  if (dayKey(previous.createdAt) !== dayKey(current.createdAt)) return false;
  return (
    new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime() <
    5 * 60_000
  );
}

export function MessageList({
  chat,
  messages,
  account,
  contacts,
  highlightMessageId,
  onReply,
}: MessageListProps) {
  const { markChatRead, settings } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastChatRef = useRef<string>();
  const lastCountRef = useRef(0);
  const [highlighted, setHighlighted] = useState<string | undefined>();

  const contactsMap = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );

  const unreadIndex =
    chat.unread > 0 ? Math.max(0, messages.length - chat.unread) : -1;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const changedChat = lastChatRef.current !== chat.id;
    const addedMessages = messages.length > lastCountRef.current;
    lastChatRef.current = chat.id;
    lastCountRef.current = messages.length;
    if (highlightMessageId) return;
    if (!changedChat && !addedMessages) return;
    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };
    scrollToBottom();
    const frame = window.requestAnimationFrame(scrollToBottom);
    const timer = window.setTimeout(scrollToBottom, 120);
    const images = Array.from(container.querySelectorAll('img'));
    images.forEach((image) => {
      if (!image.complete) image.addEventListener('load', scrollToBottom, { once: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      images.forEach((image) =>
        image.removeEventListener('load', scrollToBottom),
      );
    };
  }, [chat.id, messages.length, highlightMessageId]);

  useEffect(() => {
    if (!highlightMessageId) {
      setHighlighted(undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      const id = window.CSS?.escape?.(highlightMessageId) ?? highlightMessageId;
      const element = scrollRef.current?.querySelector<HTMLElement>(
        `[data-message-id="${id}"]`,
      );
      if (element) {
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setHighlighted(highlightMessageId);
      }
    }, 280);
    const clear = window.setTimeout(() => setHighlighted(undefined), 3200);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [highlightMessageId, chat.id]);

  let previousDay = '';

  return (
    <div
      className="messages-scroll"
      ref={scrollRef}
      aria-label={`История переписки ${chat.name}`}
    >
      <div className="messages-inner">
        {messages.length === 0 ? (
          <EmptyState
            compact
            icon={<MessageSquareDashed size={24} />}
            title="Начните разговор"
            description="История сообщений появится здесь. Все сообщения в прототипе демонстрационные."
          />
        ) : (
          messages.map((message, index) => {
            const currentDay = dayKey(message.createdAt);
            const showDay = currentDay !== previousDay;
            previousDay = currentDay;
            const previous = messages[index - 1];
            const continuation = Boolean(previous && sameGroup(previous, message));
            const showSender =
              chat.kind !== 'direct' && !message.outgoing && !continuation;
            const showAvatar = !message.outgoing && !continuation;
            const contact =
              message.senderId !== 'me' ? contactsMap.get(message.senderId) : undefined;

            return (
              <div key={message.id}>
                {showDay && (
                  <div className="day-divider">
                    <span>{formatDayLabel(message.createdAt)}</span>
                  </div>
                )}
                {index === unreadIndex && (
                  <div className="unread-divider">
                    <span className="unread-divider__line" aria-hidden="true" />
                    <span className="unread-divider__label">
                      {chat.unread}{' '}
                      {pluralizeRu(chat.unread, [
                        'новое сообщение',
                        'новых сообщения',
                        'новых сообщений',
                      ])}
                    </span>
                    <button
                      type="button"
                      className="unread-divider__action"
                      onClick={() => markChatRead(chat.id)}
                    >
                      <CheckCheck size={13} /> Прочитано
                    </button>
                    <span className="unread-divider__line" aria-hidden="true" />
                  </div>
                )}
                <MessageBubble
                  message={message}
                  chat={chat}
                  account={account}
                  contact={contact}
                  showAvatar={showAvatar}
                  showSender={showSender}
                  continuation={continuation}
                  highlight={highlighted === message.id}
                  onReply={onReply}
                />
              </div>
            );
          })
        )}

        {chat.typing && settings.typingIndicators && (
          <div className="typing-row">
            <Avatar
              name={
                chat.contactId
                  ? (contactsMap.get(chat.contactId)?.name ?? chat.name)
                  : chat.name
              }
              tone={chat.tone}
              size={30}
              kind={chat.kind}
            />
            <span className="typing-bubble" aria-label="Собеседник печатает">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
