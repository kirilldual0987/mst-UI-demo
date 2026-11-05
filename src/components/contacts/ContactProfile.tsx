import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BellOff,
  Building2,
  ChevronRight,
  Clock3,
  Copy,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  Star,
  UserRoundX,
} from 'lucide-react';
import type { Contact } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import {
  formatChatTime,
  presenceLabel,
  protocolLabel,
} from '../../lib/format';
import { Avatar } from '../ui/Avatar';
import { ProtocolBadge, StatusChip } from '../ui/Badge';
import { Button, IconButton } from '../ui/Button';
import { ActionMenu, type MenuItem } from '../ui/Menu';

interface ContactProfileProps {
  contact: Contact;
  onBack: () => void;
}

export function ContactProfile({ contact, onBack }: ContactProfileProps) {
  const { accounts, chats, messages, updateContact, createDirectChat } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const account = accounts.find((item) => item.id === contact.accountId);
  const sharedChats = useMemo(
    () => chats.filter((chat) => chat.contactId === contact.id),
    [chats, contact.id],
  );
  const sharedImages = useMemo(() => {
    const chatIds = new Set(sharedChats.map((chat) => chat.id));
    return messages
      .filter((message) => chatIds.has(message.chatId) && message.attachment?.type === 'image')
      .map((message) => message.attachment!)
      .slice(0, 3);
  }, [messages, sharedChats]);

  const startChat = () => {
    const chat = createDirectChat(contact);
    navigate(`/messages/${chat.id}`);
  };

  const copyIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(contact.handle);
      notify({ title: 'Адрес скопирован', description: contact.handle, tone: 'success' });
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
      id: 'copy',
      label: 'Скопировать адрес',
      icon: <Copy size={16} />,
      onSelect: copyIdentifier,
    },
    {
      id: 'favorite',
      label: contact.favorite ? 'Убрать из избранного' : 'Добавить в избранное',
      icon: <Star size={16} />,
      onSelect: () => {
        updateContact(contact.id, { favorite: !contact.favorite });
        notify({
          title: contact.favorite ? 'Контакт убран из избранного' : 'Контакт в избранном',
          tone: 'success',
        });
      },
    },
    {
      id: 'account',
      label: 'Настройки аккаунта',
      icon: <ShieldCheck size={16} />,
      separatorBefore: true,
      onSelect: () => navigate('/accounts'),
    },
    {
      id: 'mute',
      label: 'Отключить уведомления',
      icon: <BellOff size={16} />,
      onSelect: () =>
        notify({
          title: 'Уведомления контакта',
          description: 'Настройка доступна в настройках уведомлений Messthon.',
        }),
    },
    {
      id: 'block',
      label: 'Заблокировать контакт',
      icon: <UserRoundX size={16} />,
      danger: true,
      separatorBefore: true,
      onSelect: () =>
        notify({
          title: 'Блокировка контакта',
          description: 'Управление блокировками доступно в разделе «Приватность».',
          tone: 'warning',
        }),
    },
  ];

  return (
    <section className="contact-profile" aria-label={`Профиль ${contact.name}`}>
      <header className="contact-profile__topbar">
        <IconButton label="Назад к контактам" className="contact-profile__back" onClick={onBack}>
          <ArrowLeft size={19} />
        </IconButton>
        <span>Профиль контакта</span>
        <div className="contact-profile__top-actions">
          <IconButton
            label={contact.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            active={contact.favorite}
            onClick={() => {
              updateContact(contact.id, { favorite: !contact.favorite });
              notify({
                title: contact.favorite ? 'Контакт убран из избранного' : 'Контакт в избранном',
                tone: 'success',
              });
            }}
          >
            <Star size={18} fill={contact.favorite ? 'currentColor' : 'none'} />
          </IconButton>
          <ActionMenu items={menuItems} label="Действия с контактом" />
        </div>
      </header>

      <div className="contact-profile__scroll">
        <div className="contact-profile__container">
          <section className="contact-hero">
            <Avatar
              name={contact.name}
              tone={contact.tone}
              size={88}
              presence={contact.presence}
              protocol={contact.protocol}
            />
            <div className="contact-hero__copy">
              <div className="contact-hero__name-row">
                <h1>{contact.name}</h1>
                <span className={cn('presence-label', `presence-label--${contact.presence}`)}>
                  {presenceLabel(contact.presence)}
                </span>
              </div>
              <p>
                {contact.role} · {contact.organization}
              </p>
              <div className="contact-hero__meta">
                <ProtocolBadge protocol={contact.protocol} />
                <span className="contact-handle">{contact.handle}</span>
                {account && <StatusChip status={account.status} />}
              </div>
              <p className="contact-hero__status">{contact.statusText}</p>
            </div>
            <div className="contact-hero__actions">
              <Button icon={<MessageCircle size={17} />} onClick={startChat}>
                Написать
              </Button>
              <Button
                variant="outlined"
                icon={<Phone size={17} />}
                onClick={() =>
                  notify({
                    title: 'Звонок',
                    description:
                      'Аудиозвонки через выбранный протокол появятся после подключения шлюза.',
                  })
                }
              >
                Позвонить
              </Button>
              <ActionMenu items={menuItems} label="Ещё действия" triggerIcon={<MoreHorizontal size={18} />} />
            </div>
          </section>

          <div className="contact-profile__grid">
            <div className="contact-profile__main">
              <section className="profile-card">
                <div className="profile-card__header">
                  <h2>О контакте</h2>
                </div>
                <p className="profile-bio">{contact.bio}</p>
                <div className="profile-facts">
                  <div>
                    <Building2 size={16} />
                    <span>
                      <strong>{contact.role}</strong>
                      {contact.organization}
                    </span>
                  </div>
                  <div>
                    <MapPin size={16} />
                    <span>
                      <strong>{contact.location}</strong>
                      {contact.timezone}
                    </span>
                  </div>
                  <div>
                    <Clock3 size={16} />
                    <span>
                      <strong>В Messthon с {contact.joined}</strong>
                      Локальное время: {contact.timezone}
                    </span>
                  </div>
                  {contact.email && (
                    <div>
                      <Mail size={16} />
                      <span>
                        <strong>{contact.email}</strong>
                        Электронная почта
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {sharedChats.length > 0 && (
                <section className="profile-card">
                  <div className="profile-card__header">
                    <h2>Общие переписки</h2>
                    <span>{sharedChats.length}</span>
                  </div>
                  <div className="shared-chats">
                    {sharedChats.map((chat) => (
                      <button
                        type="button"
                        className="shared-chat"
                        key={chat.id}
                        onClick={() => navigate(`/messages/${chat.id}`)}
                      >
                        <Avatar name={chat.name} tone={chat.tone} size={34} kind={chat.kind} />
                        <span>
                          <strong>{chat.name}</strong>
                          <span>{chat.lastMessage}</span>
                        </span>
                        <span className="shared-chat__meta">
                          {formatChatTime(chat.updatedAt)}
                          <ChevronRight size={15} />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {sharedImages.length > 0 && (
                <section className="profile-card">
                  <div className="profile-card__header">
                    <h2>Общие медиа</h2>
                    <span>{sharedImages.length}</span>
                  </div>
                  <div className="profile-media">
                    {sharedImages.map((image) => (
                      <button
                        type="button"
                        key={image.name}
                        onClick={() =>
                          notify({
                            title: image.alt ?? image.name,
                            description: 'Откройте изображение из переписки, чтобы увидеть его целиком.',
                          })
                        }
                      >
                        <img src={image.url} alt={image.alt ?? image.name} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="contact-profile__side">
              <section className="profile-card">
                <div className="profile-card__header">
                  <h2>{protocolLabel(contact.protocol)}</h2>
                  <ProtocolBadge protocol={contact.protocol} />
                </div>
                <div className="detail-rows">
                  <div>
                    <span>{contact.protocol === 'matrix' ? 'Matrix ID' : 'JID'}</span>
                    <strong className="is-mono">{contact.handle}</strong>
                  </div>
                  <div>
                    <span>Сервер</span>
                    <strong>{account?.server ?? 'Неизвестно'}</strong>
                  </div>
                  {contact.protocol === 'matrix' ? (
                    <>
                      <div>
                        <span>Устройство собеседника</span>
                        <strong>Проверено</strong>
                      </div>
                      <div>
                        <span>Шифрование</span>
                        <strong>
                          <LockKeyhole size={13} /> {account?.encryptionLabel ?? 'Megolm'}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>Присутствие</span>
                        <strong>{presenceLabel(contact.presence)}</strong>
                      </div>
                      <div>
                        <span>OMEMO</span>
                        <strong>
                          <LockKeyhole size={13} /> {account?.encryptionLabel ?? 'OMEMO 0.8'}
                        </strong>
                      </div>
                      <div>
                        <span>Ресурс</span>
                        <strong>{account?.deviceLabel ?? 'Не указан'}</strong>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="profile-link"
                  onClick={() => navigate(contact.protocol === 'matrix' ? '/settings/matrix' : '/settings/xmpp')}
                >
                  Настройки {protocolLabel(contact.protocol)}
                  <ChevronRight size={14} />
                </button>
              </section>

              <section className="profile-card profile-account-card">
                <div className="profile-card__header">
                  <h2>Доступен через</h2>
                </div>
                <button
                  type="button"
                  className="profile-account"
                  onClick={() => navigate('/accounts')}
                >
                  <Avatar
                    name={account?.displayName ?? 'Аккаунт'}
                    tone={account?.tone ?? 0}
                    size={38}
                    protocol={contact.protocol}
                  />
                  <span>
                    <strong>{account?.displayName}</strong>
                    <span>{account?.handle}</span>
                  </span>
                  <ChevronRight size={15} />
                </button>
                <p className="profile-note">
                  Идентичность контакта не смешивается с другими аккаунтами Messthon.
                </p>
              </section>

              <section className="profile-card">
                <div className="profile-card__header">
                  <h2>Совместимость</h2>
                </div>
                <div className="capability-list">
                  <span>
                    <ShieldCheck size={15} /> Сквозное шифрование
                  </span>
                  <span>
                    <Copy size={15} /> {contact.protocol === 'matrix' ? 'Matrix rooms' : 'XMPP MUC'}
                  </span>
                  <span>
                    <Star size={15} /> Единая лента Messthon
                  </span>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
