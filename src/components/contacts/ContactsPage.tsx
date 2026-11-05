import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ContactRound,
  Search,
  SearchX,
  Star,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { Contact } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/cn';
import {
  pluralizeRu,
  presenceLabel,
  protocolLabel,
} from '../../lib/format';
import { MobileMenuButton } from '../layout/PageHeader';
import { SearchField, SelectChip, ProtocolBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button, IconButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ContactProfile } from './ContactProfile';
import { AddContactModal } from './AddContactModal';

type ContactFilter = 'all' | 'online' | 'favorites' | 'matrix' | 'xmpp';

const FILTERS: Array<{ value: ContactFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'online', label: 'Онлайн' },
  { value: 'favorites', label: 'Избранные' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'xmpp', label: 'XMPP' },
];

function groupContacts(contacts: Contact[]): Array<[string, Contact[]]> {
  const collator = new Intl.Collator('ru');
  const sorted = [...contacts].sort((left, right) =>
    collator.compare(left.name, right.name),
  );
  const groups = new Map<string, Contact[]>();
  for (const contact of sorted) {
    const letter = contact.name.trim().charAt(0).toUpperCase() || '#';
    const list = groups.get(letter) ?? [];
    list.push(contact);
    groups.set(letter, list);
  }
  return [...groups.entries()];
}

export function ContactsPage() {
  const { contacts, chats, accounts } = useApp();
  const { openSearch } = useUi();
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ContactFilter>('all');
  const [addOpen, setAddOpen] = useState(false);

  const selectedContact = contacts.find((contact) => contact.id === contactId);

  useEffect(() => {
    if (contactId && !selectedContact) navigate('/contacts', { replace: true });
  }, [contactId, navigate, selectedContact]);

  useEffect(() => {
    if (searchParams.get('add') === '1') setAddOpen(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isDesktop || contactId || !contacts.length) return;
    const preferred = contacts.find((contact) => contact.favorite) ?? contacts[0];
    navigate(`/contacts/${preferred.id}`, { replace: true });
  }, [contacts, contactId, isDesktop, navigate]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru-RU');
    return contacts.filter((contact) => {
      const matchesQuery = needle
        ? `${contact.name} ${contact.handle} ${contact.organization} ${contact.role}`
            .toLocaleLowerCase('ru-RU')
            .includes(needle)
        : true;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'online' && contact.presence === 'online') ||
        (filter === 'favorites' && contact.favorite) ||
        (filter === 'matrix' && contact.protocol === 'matrix') ||
        (filter === 'xmpp' && contact.protocol === 'xmpp');
      return matchesQuery && matchesFilter;
    });
  }, [contacts, query, filter]);

  const groups = useMemo(() => groupContacts(filtered), [filtered]);
  const hasFilter = Boolean(query.trim()) || filter !== 'all';
  const favoriteCount = contacts.filter((contact) => contact.favorite).length;
  const onlineCount = contacts.filter((contact) => contact.presence === 'online').length;

  const openContact = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
  };

  return (
    <div className={cn('contacts-page', selectedContact && 'has-selection')}>
      <aside className="contacts-pane" aria-label="Список контактов">
        <header className="contacts-header">
          <MobileMenuButton className="contacts-header__menu" />
          <div className="contacts-header__copy">
            <h1>Контакты</h1>
            <p>
              {contacts.length} {pluralizeRu(contacts.length, ['контакт', 'контакта', 'контактов'])} ·{' '}
              {onlineCount} в сети
            </p>
          </div>
          <IconButton
            label="Глобальный поиск"
            className="contacts-header__search"
            onClick={() => openSearch()}
          >
            <Search size={18} />
          </IconButton>
          <Button
            variant="tonal"
            size="sm"
            icon={<UserPlus size={16} />}
            className="contacts-header__add"
            onClick={() => setAddOpen(true)}
          >
            Добавить
          </Button>
        </header>

        <div className="contacts-tools">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Имя, адрес или организация"
            label="Поиск контактов"
          />
          <div className="contacts-filters" role="group" aria-label="Фильтр контактов">
            {FILTERS.map((item) => (
              <SelectChip
                key={item.value}
                selected={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
                {item.value === 'favorites' && (
                  <Star size={12} fill={filter === 'favorites' ? 'currentColor' : 'none'} />
                )}
              </SelectChip>
            ))}
          </div>
          <div className="contacts-tools__summary">
            <span>
              {filtered.length}{' '}
              {pluralizeRu(filtered.length, ['контакт', 'контакта', 'контактов'])}
            </span>
            <span>{favoriteCount} в избранном</span>
          </div>
        </div>

        <div className="contacts-scroll" aria-label="Контакты">
          {groups.length ? (
            groups.map(([letter, group]) => (
              <section className="contact-group" key={letter} aria-label={`Контакты на ${letter}`}>
                <h2 className="contact-group__title">{letter}</h2>
                {group.map((contact) => {
                  const account = accounts.find((item) => item.id === contact.accountId);
                  const directChat = chats.find(
                    (chat) => chat.kind === 'direct' && chat.contactId === contact.id,
                  );
                  return (
                    <button
                      type="button"
                      key={contact.id}
                      className={cn(
                        'contact-row',
                        contactId === contact.id && 'is-active',
                      )}
                      aria-current={contactId === contact.id ? 'true' : undefined}
                      onClick={() => openContact(contact)}
                    >
                      <Avatar
                        name={contact.name}
                        tone={contact.tone}
                        size={43}
                        presence={contact.presence}
                        protocol={contact.protocol}
                      />
                      <span className="contact-row__copy">
                        <span className="contact-row__name">
                          {contact.name}
                          {contact.favorite && (
                            <Star
                              size={12}
                              className="contact-row__star"
                              fill="currentColor"
                              aria-label="В избранном"
                            />
                          )}
                        </span>
                        <span className="contact-row__status">
                          <span className={cn('presence-label', `presence-label--${contact.presence}`)}>
                            {presenceLabel(contact.presence)}
                          </span>
                          <span>·</span>
                          <span>{contact.organization}</span>
                        </span>
                        <span className="contact-row__meta">
                          <ProtocolBadge protocol={contact.protocol} />
                          <span>{account?.shortName ?? protocolLabel(contact.protocol)}</span>
                          {directChat && <span>· есть переписка</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </section>
            ))
          ) : (
            <div className="contacts-empty">
              <EmptyState
                compact
                icon={hasFilter ? <SearchX size={24} /> : <UsersRound size={24} />}
                title={hasFilter ? 'Контакты не найдены' : 'Пока нет контактов'}
                description={
                  hasFilter
                    ? 'Измените запрос или сбросьте фильтры.'
                    : 'Добавьте первый контакт из подключённого аккаунта.'
                }
                action={
                  hasFilter ? (
                    <Button variant="text" onClick={resetFilters}>
                      Сбросить фильтры
                    </Button>
                  ) : (
                    <Button
                      variant="tonal"
                      icon={<UserPlus size={16} />}
                      onClick={() => setAddOpen(true)}
                    >
                      Добавить контакт
                    </Button>
                  )
                }
              />
            </div>
          )}
        </div>
      </aside>

      <main className="contacts-detail">
        {selectedContact ? (
          <ContactProfile
            contact={selectedContact}
            onBack={() => navigate('/contacts')}
          />
        ) : (
          <div className="contacts-detail__empty">
            <EmptyState
              icon={<ContactRound size={28} />}
              title="Выберите контакт"
              description="Здесь появятся профиль, общие переписки и параметры протокола."
            />
          </div>
        )}
      </main>

      <AddContactModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          if (searchParams.get('add') === '1') {
            const next = new URLSearchParams(searchParams);
            next.delete('add');
            setSearchParams(next, { replace: true });
          }
        }}
      />
    </div>
  );
}
