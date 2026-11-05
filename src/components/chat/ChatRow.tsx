import { memo, type MouseEvent } from 'react';
import { BellOff, Pin } from 'lucide-react';
import type { Account, Chat, Contact } from '../../types';
import { cn } from '../../lib/cn';
import { formatChatTime, protocolLabel } from '../../lib/format';
import { Avatar, UnreadBadge } from '../ui/Avatar';
import { ProtocolBadge } from '../ui/Badge';
import { ActionMenu, type MenuItem } from '../ui/Menu';

interface ChatRowProps {
  chat: Chat;
  account?: Account;
  contact?: Contact;
  active: boolean;
  menuItems: MenuItem[];
  showProtocolLabels?: boolean;
  showTyping?: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const ChatRow = memo(function ChatRow({
  chat,
  account,
  contact,
  active,
  menuItems,
  showProtocolLabels = true,
  showTyping = true,
  onClick,
  onContextMenu,
}: ChatRowProps) {
  const preview = chat.typing && showTyping
    ? 'печатает…'
    : chat.lastSender && chat.lastSender !== 'Вы' && chat.kind !== 'direct'
      ? `${chat.lastSender}: ${chat.lastMessage}`
      : chat.lastMessage;

  return (
    <div className={cn('chat-row-shell', active && 'is-active')}>
      <button
        type="button"
        className="chat-row"
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={(event) => {
          if (event.shiftKey && event.key === 'F10') {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const synthetic = {
              preventDefault: () => undefined,
              clientX: rect.right - 20,
              clientY: rect.top + 24,
            } as MouseEvent<HTMLButtonElement>;
            onContextMenu(synthetic);
          }
        }}
      >
        <Avatar
          name={chat.name}
          tone={chat.tone}
          size={44}
          kind={chat.kind}
          presence={contact?.presence}
        />
        <span className="chat-row__body">
          <span className="chat-row__top">
            <span className="chat-row__name">{chat.name}</span>
            <span className="chat-row__time">{formatChatTime(chat.updatedAt)}</span>
          </span>
          <span className={cn('chat-row__preview', chat.typing && 'is-typing')}>
            {preview}
          </span>
          <span className="chat-row__meta">
            <ProtocolBadge protocol={chat.protocol} compact={!showProtocolLabels} />
            <span className="chat-row__account">
              {account?.shortName ?? account?.displayName ?? protocolLabel(chat.protocol)}
            </span>
            {chat.pinned && (
              <span className="chat-row__flag" title="Закреплено">
                <Pin size={11} aria-hidden="true" /> Закреплено
              </span>
            )}
            {chat.muted && (
              <span className="chat-row__flag" title="Уведомления отключены">
                <BellOff size={11} aria-hidden="true" />
              </span>
            )}
          </span>
        </span>
        <span className="chat-row__trailing">
          <UnreadBadge count={chat.unread} muted={chat.muted} />
        </span>
      </button>
      <ActionMenu
        items={menuItems}
        label={`Действия с чатом ${chat.name}`}
        buttonClassName="chat-row__menu-button"
        size="sm"
      />
    </div>
  );
});
