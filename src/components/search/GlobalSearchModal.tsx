import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ContactRound,
  MessageSquareText,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { flattenSearchResults, searchEverything } from '../../lib/search';
import { formatChatTime, formatMessageTime, protocolLabel } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Modal } from '../ui/Modal';
import { SearchField, ProtocolBadge } from '../ui/Badge';
import { Avatar, ProtocolGlyph } from '../ui/Avatar';
import type { SearchHit } from '../../types';

const suggestions = ['Alina', 'OMEMO', 'дизайн', 'аккаунт'];

export function GlobalSearchModal() {
  const { searchOpen, closeSearch, searchScopeChatId } = useUi();
  const { chats, contacts, accounts, messages } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const scopedChat = searchScopeChatId
    ? chats.find((chat) => chat.id === searchScopeChatId)
    : undefined;

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [searchOpen, searchScopeChatId]);

  const results = useMemo(
    () =>
      searchEverything(query, { chats, contacts, messages }, searchScopeChatId),
    [query, chats, contacts, messages, searchScopeChatId],
  );

  const visibleResults = useMemo(() => {
    if (!searchScopeChatId) return results;
    return { ...results, chats: [], contacts: [] };
  }, [results, searchScopeChatId]);

  const flat = useMemo(() => flattenSearchResults(visibleResults), [visibleResults]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const selectHit = (hit: SearchHit) => {
    closeSearch();
    if (hit.type === 'contact' && hit.contactId) {
      navigate(`/contacts/${hit.contactId}`);
      return;
    }
    if (hit.chatId) {
      const messageParam =
        hit.type === 'message' ? `?message=${hit.id.replace('message-', '')}` : '';
      navigate(`/messages/${hit.chatId}${messageParam}`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!flat.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flat.length);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flat.length) % flat.length);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = flat[activeIndex];
      if (hit) selectHit(hit);
    }
  };

  const chatForMessage = (chatId?: string) =>
    chats.find((chat) => chat.id === chatId);

  const groupedRows: Array<{
    key: SearchHit['type'];
    label: string;
    hits: SearchHit[];
    offset: number;
  }> = [];
  let offset = 0;
  if (!searchScopeChatId) {
    if (visibleResults.chats.length) {
      groupedRows.push({
        key: 'chat',
        label: 'Переписки',
        hits: visibleResults.chats.map((chat) => ({
          id: `chat-${chat.id}`,
          type: 'chat',
          title: chat.name,
          subtitle: chat.lastMessage,
          chatId: chat.id,
        })),
        offset,
      });
      offset += visibleResults.chats.length;
    }
    if (visibleResults.contacts.length) {
      groupedRows.push({
        key: 'contact',
        label: 'Контакты',
        hits: visibleResults.contacts.map((contact) => ({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: contact.name,
          subtitle: contact.handle,
          contactId: contact.id,
        })),
        offset,
      });
      offset += visibleResults.contacts.length;
    }
  }
  if (visibleResults.messages.length) {
    groupedRows.push({
      key: 'message',
      label: searchScopeChatId ? 'Сообщения в этом чате' : 'Сообщения',
      hits: visibleResults.messages.map((message) => ({
        id: `message-${message.id}`,
        type: 'message',
        title: message.senderName,
        subtitle: message.text ?? message.attachment?.name ?? 'Вложение',
        chatId: message.chatId,
      })),
      offset,
    });
  }

  return (
    <Modal
      open={searchOpen}
      onClose={closeSearch}
      title={scopedChat ? 'Поиск в чате' : 'Поиск в Messthon'}
      description={
        scopedChat
          ? `${scopedChat.name} · ${protocolLabel(scopedChat.protocol)}`
          : 'Переписки, контакты и сообщения во всех подключённых аккаунтах'
      }
      size="lg"
      className="search-modal"
    >
      <div className="search-modal__field">
        <SearchField
          value={query}
          onChange={setQuery}
          autoFocus
          placeholder={
            scopedChat ? `Найти в «${scopedChat.name}»` : 'Найти чат, сообщение или контакт'
          }
          label="Глобальный поиск"
          onKeyDown={handleKeyDown}
        />
        <span className="search-modal__filter-hint">
          <SlidersHorizontal size={14} />
          Все аккаунты
        </span>
      </div>

      <div className="search-modal__body" aria-label="Результаты поиска">
        {query.trim().length < 2 ? (
          <div className="search-suggestions">
            <p>Начните вводить запрос. Например:</p>
            <div className="search-suggestions__chips">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  className="chip"
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : flat.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty__icon">
              <SearchX size={22} />
            </span>
            <strong>Ничего не найдено</strong>
            <p>
              Попробуйте изменить запрос, проверить раскладку или искать по имени
              аккаунта.
            </p>
          </div>
        ) : (
          groupedRows.map((group) => (
            <section className="search-group" key={group.key}>
              <h3 className="search-group__title">{group.label}</h3>
              {group.hits.map((hit, index) => {
                const flatIndex = group.offset + index;
                const chat = chatForMessage(hit.chatId);
                const contact = contacts.find(
                  (item) =>
                    item.id ===
                    (hit.contactId ??
                      (hit.type === 'chat' ? chat?.contactId : undefined)),
                );
                const isActive = activeIndex === flatIndex;
                return (
                  <button
                    type="button"
                    key={hit.id}
                    className={cn('search-result', isActive && 'is-active')}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    onClick={() => selectHit(hit)}
                  >
                    <span className="search-result__leading">
                      {hit.type === 'message' ? (
                        <span className="search-result__message-icon">
                          <MessageSquareText size={18} />
                        </span>
                      ) : contact ? (
                        <Avatar
                          name={contact.name}
                          tone={contact.tone}
                          size={36}
                          protocol={contact.protocol}
                        />
                      ) : chat ? (
                        <Avatar
                          name={chat.name}
                          tone={chat.tone}
                          size={36}
                          kind={chat.kind}
                        />
                      ) : (
                        <span className="search-result__message-icon">
                          <ContactRound size={18} />
                        </span>
                      )}
                    </span>
                    <span className="search-result__copy">
                      <span className="search-result__title-row">
                        <strong>{hit.title}</strong>
                        {hit.type === 'chat' && chat && (
                          <ProtocolBadge protocol={chat.protocol} compact />
                        )}
                        {hit.type === 'contact' && contact && (
                          <ProtocolBadge protocol={contact.protocol} compact />
                        )}
                      </span>
                      <span className="search-result__subtitle">{hit.subtitle}</span>
                      {hit.type === 'message' && chat && (
                        <span className="search-result__meta">
                          <ProtocolGlyph protocol={chat.protocol} />
                          {chat.name}
                          <span>·</span>
                          {(() => {
                            const message = messages.find(
                              (item) => item.id === hit.id.replace('message-', ''),
                            );
                            return message ? formatMessageTime(message.createdAt) : '';
                          })()}
                        </span>
                      )}
                      {hit.type === 'chat' && chat && (
                        <span className="search-result__meta">
                          {accounts.find((account) => account.id === chat.accountId)
                            ?.handle ?? 'Аккаунт Messthon'}
                          <span>·</span>
                          {formatChatTime(chat.updatedAt)}
                        </span>
                      )}
                    </span>
                    <ArrowRight size={17} className="search-result__arrow" aria-hidden="true" />
                  </button>
                );
              })}
            </section>
          ))
        )}
      </div>
      <footer className="search-modal__footer">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> навигация
        </span>
        <span>
          <kbd>Enter</kbd> открыть
        </span>
        <span>
          <kbd>Esc</kbd> закрыть
        </span>
      </footer>
    </Modal>
  );
}
