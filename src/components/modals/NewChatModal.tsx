import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, SearchX, UserPlus, Users, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { Modal } from '../ui/Modal';
import { SearchField, ProtocolBadge } from '../ui/Badge';
import { Avatar, PresenceDot } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { presenceLabel } from '../../lib/format';

export function NewChatModal() {
  const { newChatOpen, closeNewChat, notify } = useUi();
  const { contacts, accounts, chats, createDirectChat } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (newChatOpen) setQuery('');
  }, [newChatOpen]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru-RU');
    return contacts
      .filter((contact) => {
        if (!needle) return true;
        return `${contact.name} ${contact.handle} ${contact.organization}`
          .toLocaleLowerCase('ru-RU')
          .includes(needle);
      })
      .sort((left, right) => {
        if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
        return left.name.localeCompare(right.name, 'ru');
      });
  }, [contacts, query]);

  const startChat = (contact: (typeof contacts)[number]) => {
    const chat = createDirectChat(contact);
    closeNewChat();
    navigate(`/messages/${chat.id}`);
  };

  return (
    <Modal
      open={newChatOpen}
      onClose={closeNewChat}
      title="Новое сообщение"
      description="Выберите контакт из любого подключённого аккаунта."
      size="md"
    >
      <div className="new-chat-modal">
        <SearchField
          value={query}
          onChange={setQuery}
          autoFocus
          placeholder="Имя, адрес или организация"
          label="Поиск контакта для нового сообщения"
        />
        <div className="new-chat-list" role="list">
          {filtered.length ? (
            filtered.map((contact) => {
              const account = accounts.find((item) => item.id === contact.accountId);
              const existing = chats.some(
                (chat) => chat.kind === 'direct' && chat.contactId === contact.id,
              );
              return (
                <button
                  type="button"
                  role="listitem"
                  key={contact.id}
                  className="new-chat-row"
                  onClick={() => startChat(contact)}
                >
                  <Avatar
                    name={contact.name}
                    tone={contact.tone}
                    size={42}
                    presence={contact.presence}
                    protocol={contact.protocol}
                  />
                  <span className="new-chat-row__copy">
                    <span className="new-chat-row__name">{contact.name}</span>
                    <span className="new-chat-row__meta">
                      <ProtocolBadge protocol={contact.protocol} />
                      <span>{contact.handle}</span>
                    </span>
                    <span className="new-chat-row__account">
                      через {account?.displayName ?? 'аккаунт Messthon'}
                    </span>
                  </span>
                  <span className="new-chat-row__action">
                    <MessageCircle size={17} />
                    {existing ? 'Открыть' : 'Написать'}
                  </span>
                </button>
              );
            })
          ) : (
            <EmptyState
              compact
              icon={<SearchX size={22} />}
              title="Контакт не найден"
              description="Проверьте адрес или добавьте контакт вручную."
            />
          )}
        </div>
        <div className="new-chat-modal__hint">
          <span>
            <PresenceDot presence="online" label={presenceLabel('online')} /> Доступны
            контакты из всех аккаунтов
          </span>
          <span>{contacts.length} контактов</span>
        </div>
      </div>
      <div className="modal-extra-actions">
        <Button
          variant="text"
          icon={<UserPlus size={17} />}
          onClick={() => {
            closeNewChat();
            navigate('/contacts?add=1');
          }}
        >
          Добавить контакт
        </Button>
        <Button
          variant="text"
          icon={<Users size={17} />}
          onClick={() =>
            notify({
              title: 'Группы',
              description:
                'Создание новых групп появится после подключения протокольных адаптеров.',
            })
          }
        >
          Создать группу
        </Button>
      </div>
      <div className="new-chat-modal__close">
        <button type="button" className="text-link" onClick={closeNewChat}>
          <X size={14} /> Закрыть
        </button>
      </div>
    </Modal>
  );
}
