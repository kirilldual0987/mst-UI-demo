import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  Hash,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { Chat } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import {
  chatKindLabel,
  formatMessageTime,
  pluralizeRu,
  presenceLabel,
  protocolLabel,
} from '../../lib/format';
import { Avatar } from '../ui/Avatar';
import { StatusChip, Tabs, ToggleRow } from '../ui/Badge';
import { Button, IconButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface ChatInfoPanelProps {
  chat: Chat;
  onClose: () => void;
}

type InfoTab = 'overview' | 'files' | 'security';

export function ChatInfoPanel({ chat, onClose }: ChatInfoPanelProps) {
  const {
    accounts,
    contacts,
    messages,
    toggleChatFlag,
  } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const [tab, setTab] = useState<InfoTab>('overview');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const account = accounts.find((item) => item.id === chat.accountId);
  const contact = contacts.find((item) => item.id === chat.contactId);
  const members = (chat.memberIds ?? [])
    .map((id) => contacts.find((item) => item.id === id))
    .filter((member): member is NonNullable<typeof member> => Boolean(member));

  const chatMessages = useMemo(
    () => messages.filter((message) => message.chatId === chat.id),
    [messages, chat.id],
  );

  const attachments = useMemo(
    () => chatMessages.flatMap((message) => (message.attachment ? [message.attachment] : [])),
    [chatMessages],
  );
  const images = attachments.filter(
    (attachment) => attachment.type === 'image' && attachment.url,
  );
  const files = attachments.filter((attachment) => attachment.type === 'file');

  const notifyDemo = (title: string, description?: string) =>
    notify({ title, description });

  const copyIdentifier = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      notify({ title: 'Скопировано', description: value, tone: 'success' });
    } catch {
      notify({
        title: 'Не удалось скопировать',
        description: 'Буфер обмена недоступен в этом браузере.',
        tone: 'error',
      });
    }
  };

  const protocolSettingsPath = chat.protocol === 'matrix' ? '/settings/matrix' : '/settings/xmpp';

  const infoRow = (
    label: string,
    value: string,
    options?: { copy?: boolean; mono?: boolean },
  ) => (
    <div className="info-row">
      <span>{label}</span>
      <strong className={cn(options?.mono && 'is-mono')}>
        {value}
        {options?.copy && (
          <button
            type="button"
            className="info-row__copy"
            aria-label={`Скопировать ${label}`}
            onClick={() => copyIdentifier(value)}
          >
            <Copy size={13} />
          </button>
        )}
      </strong>
    </div>
  );

  return (
    <aside className="info-panel" aria-label={`Информация о чате ${chat.name}`}>
      <header className="info-panel__header">
        <span>Информация</span>
        <IconButton label="Закрыть панель информации" size="sm" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </header>

      <div className="info-panel__hero">
        <Avatar
          name={chat.name}
          tone={chat.tone}
          size={72}
          kind={chat.kind}
          presence={contact?.presence}
        />
        <h2>{chat.name}</h2>
        <p>
          {chat.kind === 'direct' && contact
            ? `${protocolLabel(chat.protocol)} · ${presenceLabel(contact.presence)}`
            : `${chatKindLabel(chat.kind)} · ${chat.memberCount ?? members.length} ${pluralizeRu(
                chat.memberCount ?? members.length,
                ['участник', 'участника', 'участников'],
              )}`}
        </p>
        <div className="info-panel__hero-actions">
          {chat.kind === 'direct' && contact ? (
            <Button
              variant="tonal"
              size="sm"
              icon={<UserRound size={16} />}
              onClick={() => navigate(`/contacts/${contact.id}`)}
            >
              Профиль
            </Button>
          ) : (
            <Button
              variant="tonal"
              size="sm"
              icon={<Users size={16} />}
              onClick={() =>
                notifyDemo(
                  'Участники',
                  'Полный список участников откроется после подключения адаптера комнаты.',
                )
              }
            >
              Участники
            </Button>
          )}
          <IconButton
            label={chat.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            active={chat.favorite}
            onClick={() => {
              toggleChatFlag(chat.id, 'favorite');
              notify({
                title: chat.favorite ? 'Убрано из избранного' : 'Добавлено в избранное',
                tone: 'success',
              });
            }}
          >
            <Star size={18} fill={chat.favorite ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton
            label={chat.muted ? 'Включить уведомления' : 'Отключить уведомления'}
            active={chat.muted}
            onClick={() => {
              toggleChatFlag(chat.id, 'muted');
              notify({
                title: chat.muted ? 'Уведомления включены' : 'Уведомления отключены',
                tone: 'success',
              });
            }}
          >
            {chat.muted ? <BellOff size={18} /> : <Bell size={18} />}
          </IconButton>
        </div>
      </div>

      <Tabs
        tabs={[
          { value: 'overview', label: 'Обзор' },
          { value: 'files', label: 'Файлы' },
          { value: 'security', label: 'Безопасность' },
        ]}
        value={tab}
        onChange={(value) => setTab(value as InfoTab)}
        label="Разделы информации о чате"
        className="info-panel__tabs"
      />

      <div className="info-panel__body">
        {tab === 'overview' && (
          <>
            {(chat.description || chat.topic) && (
              <section className="info-section">
                <div className="info-section__title">
                  <span>{chat.kind === 'space' ? 'О пространстве' : 'О чате'}</span>
                </div>
                {chat.topic && <div className="info-topic"># {chat.topic}</div>}
                <p className="info-description">{chat.description}</p>
              </section>
            )}

            {contact && chat.kind === 'direct' && (
              <section className="info-section">
                <div className="info-section__title">Контакт</div>
                <div className="contact-mini">
                  <Avatar
                    name={contact.name}
                    tone={contact.tone}
                    size={36}
                    presence={contact.presence}
                    protocol={contact.protocol}
                  />
                  <div>
                    <strong>{contact.name}</strong>
                    <span>{contact.role} · {contact.organization}</span>
                  </div>
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
                <button
                  type="button"
                  className="info-open-profile"
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  Открыть профиль
                </button>
                {contact.bio && <p className="info-description">{contact.bio}</p>}
              </section>
            )}

            {members.length > 0 && (
              <section className="info-section">
                <div className="info-section__title">
                  <span>Участники</span>
                  <span>{chat.memberCount ?? members.length}</span>
                </div>
                <div className="info-members">
                  {members.slice(0, 4).map((member) => (
                    <button
                      type="button"
                      className="info-member"
                      key={member.id}
                      onClick={() => navigate(`/contacts/${member.id}`)}
                    >
                      <Avatar
                        name={member.name}
                        tone={member.tone}
                        size={30}
                        presence={member.presence}
                        protocol={member.protocol}
                      />
                      <span>
                        <strong>{member.name}</strong>
                        <span>{presenceLabel(member.presence)}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {(chat.memberCount ?? members.length) > 4 && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      notifyDemo(
                        'Все участники',
                        `В комнате ${chat.memberCount ?? members.length} участников. Список доступен после подключения адаптера.`,
                      )
                    }
                  >
                    Показать всех участников
                  </button>
                )}
              </section>
            )}

            <section className="info-section">
              <div className="info-section__title">Аккаунт</div>
              <div className="info-account">
                <Avatar
                  name={account?.displayName ?? 'Аккаунт'}
                  tone={account?.tone ?? 0}
                  size={34}
                  protocol={chat.protocol}
                />
                <div>
                  <strong>{account?.displayName ?? 'Неизвестный аккаунт'}</strong>
                  <span>{account?.handle}</span>
                </div>
                {account && <StatusChip status={account.status} />}
              </div>
              <div className="info-rows">
                {infoRow('Протокол', protocolLabel(chat.protocol))}
                {infoRow('Сервер', account?.server ?? '—')}
                {chat.encrypted && infoRow('Шифрование', 'Сквозное · включено')}
              </div>
              <button
                type="button"
                className="info-settings-link"
                onClick={() => navigate(protocolSettingsPath)}
              >
                <Settings2 size={15} />
                Настройки {protocolLabel(chat.protocol)}
                <ChevronRight size={14} />
              </button>
            </section>

            <section className="info-section info-section--rows">
              <ToggleRow
                title="Уведомления"
                description="Сообщения и упоминания"
                checked={!chat.muted}
                onChange={() => {
                  toggleChatFlag(chat.id, 'muted');
                  notify({
                    title: chat.muted ? 'Уведомления включены' : 'Уведомления отключены',
                    tone: 'success',
                  });
                }}
              />
              <ToggleRow
                title="Закрепить чат"
                description="Всегда сверху в списке"
                checked={chat.pinned}
                onChange={() => {
                  toggleChatFlag(chat.id, 'pinned');
                  notify({
                    title: chat.pinned ? 'Чат откреплён' : 'Чат закреплён',
                    tone: 'success',
                  });
                }}
              />
            </section>
          </>
        )}

        {tab === 'files' && (
          <>
            <section className="info-section">
              <div className="info-section__title">
                <span>Изображения</span>
                <span>{images.length}</span>
              </div>
              {images.length ? (
                <div className="info-media-grid">
                  {images.map((image) => (
                    <button
                      type="button"
                      key={image.name}
                      onClick={() => setPreviewImage(image.url ?? '')}
                      title={image.alt ?? image.name}
                    >
                      <img src={image.url} alt={image.alt ?? image.name} loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="info-muted">В этом чате пока нет изображений.</p>
              )}
            </section>
            <section className="info-section">
              <div className="info-section__title">
                <span>Файлы</span>
                <span>{files.length}</span>
              </div>
              {files.length ? (
                <div className="info-file-list">
                  {files.map((file) => (
                    <div className="info-file" key={file.name}>
                      <span className="info-file__icon">
                        <FileText size={18} />
                      </span>
                      <span>
                        <strong>{file.name}</strong>
                        <span>{file.meta}{file.size ? ` · ${file.size}` : ''}</span>
                      </span>
                      {file.url ? (
                        <a href={file.url} download aria-label={`Скачать ${file.name}`}>
                          <Download size={16} />
                        </a>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Скачать ${file.name}`}
                          onClick={() =>
                            notifyDemo(
                              'Демонстрационное вложение',
                              'Файл доступен только в полной версии Messthon.',
                            )
                          }
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="info-muted">В этом чате пока нет файлов.</p>
              )}
            </section>
            {!images.length && !files.length && (
              <EmptyState
                compact
                icon={<ImageIcon size={22} />}
                title="Нет вложений"
                description="Изображения и файлы из переписки появятся здесь."
              />
            )}
          </>
        )}

        {tab === 'security' && (
          <>
            <section className="info-section">
              <div className="info-section__title">
                <span>
                  {chat.protocol === 'matrix' ? 'Matrix Security' : 'XMPP Security'}
                </span>
                <ShieldCheck size={17} />
              </div>
              <div className={cn('security-state', chat.encrypted ? 'is-secure' : 'is-plain')}>
                {chat.encrypted ? <LockKeyhole size={20} /> : <KeyRound size={20} />}
                <div>
                  <strong>
                    {chat.encrypted
                      ? chat.protocol === 'matrix'
                        ? 'Megolm включён'
                        : 'OMEMO включён'
                      : 'Шифрование не включено'}
                  </strong>
                  <span>
                    {chat.encrypted
                      ? 'Сообщения защищены сквозным шифрованием этого протокола'
                      : 'Протокол работает без сквозного шифрования'}
                  </span>
                </div>
              </div>
              <div className="info-rows">
                {chat.protocol === 'matrix' ? (
                  <>
                    {infoRow('Matrix ID', contact?.handle ?? `#${chat.id}:${account?.server ?? 'messthon.chat'}`, { copy: true, mono: true })}
                    {infoRow('Homeserver', account?.server ?? '—', { mono: true })}
                    {infoRow('Шифрование', account?.encryptionLabel ?? 'Megolm')}
                    {infoRow('Устройство', account?.deviceLabel ?? 'Не подтверждено')}
                    {chat.kind !== 'direct' && infoRow('Права доступа', 'Администратор комнаты')}
                  </>
                ) : (
                  <>
                    {infoRow('JID', contact?.handle ?? `${chat.id}@${account?.server ?? 'xmpp'}`.toLowerCase(), { copy: true, mono: true })}
                    {infoRow('Сервер', account?.server ?? '—', { mono: true })}
                    {infoRow('OMEMO', account?.encryptionLabel ?? 'OMEMO 0.8')}
                    {infoRow('Ресурсы', account?.deviceLabel ?? 'Не подключено')}
                    {infoRow(
                      'Присутствие',
                      contact ? presenceLabel(contact.presence) : 'Групповая конференция',
                    )}
                    {chat.kind !== 'direct' && infoRow('Тип', 'MUC · групповая конференция')}
                  </>
                )}
              </div>
              <div className="security-actions">
                <Button
                  variant="tonal"
                  size="sm"
                  icon={<Fingerprint size={16} />}
                  onClick={() =>
                    notifyDemo(
                      chat.protocol === 'matrix' ? 'Проверка устройств' : 'Проверка OMEMO',
                      chat.protocol === 'matrix'
                        ? 'Устройства этого чата отмечены как проверенные в демонстрационном режиме.'
                        : 'Сессия OMEMO активна. Управление ключами доступно в настройках XMPP.',
                    )
                  }
                >
                  {chat.protocol === 'matrix' ? 'Проверить устройства' : 'Проверить OMEMO'}
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  icon={<ExternalLink size={15} />}
                  onClick={() => navigate(protocolSettingsPath)}
                >
                  Настройки безопасности
                </Button>
              </div>
              <p className="security-note">
                <Check size={13} /> Функции безопасности относятся только к{' '}
                {protocolLabel(chat.protocol)} и не отображаются как универсальные для
                других протоколов.
              </p>
            </section>

            <section className="info-section">
              <div className="info-section__title">Комната</div>
              <div className="info-rows">
                {infoRow('Название', chat.name)}
                {infoRow('Тип', chatKindLabel(chat.kind))}
                {infoRow('Участники', String(chat.memberCount ?? 1))}
                {infoRow('ID', chat.protocol === 'matrix' ? `!${chat.id}:${account?.server}` : `${chat.id}@muc.${account?.server}`, { mono: true, copy: true })}
              </div>
              <button
                type="button"
                className="info-settings-link"
                onClick={() =>
                  notifyDemo(
                    'Права доступа',
                    'Просмотр и изменение прав участников доступны в полной версии.',
                  )
                }
              >
                <Hash size={15} />
                Управление комнатой
                <ChevronRight size={14} />
              </button>
            </section>
          </>
        )}
      </div>

      <footer className="info-panel__footer">
        <span>обновлено {formatMessageTime(chatMessages.at(-1)?.createdAt ?? chat.updatedAt)}</span>
        <button type="button" className="text-link" onClick={() => navigate('/settings')}>
          Настройки
        </button>
      </footer>

      <Modal
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title="Изображение из чата"
        size="lg"
        className="image-lightbox"
      >
        {previewImage && (
          <img src={previewImage} alt="Изображение из переписки" className="image-lightbox__img" />
        )}
      </Modal>
    </aside>
  );
}
