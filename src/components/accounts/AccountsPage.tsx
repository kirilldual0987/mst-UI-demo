import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Copy,
  Link2,
  LoaderCircle,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  Unplug,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { Account } from '../../types';
import { useApp } from '../../state/AppContext';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import { pluralizeRu, protocolLabel } from '../../lib/format';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  ProtocolBadge,
  StatusChip,
} from '../ui/Badge';
import { ActionMenu, type MenuItem } from '../ui/Menu';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { AddAccountModal } from './AddAccountModal';

export function AccountsPage() {
  const {
    accounts,
    chats,
    contacts,
    setAccountStatus,
    removeAccount,
  } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Account | null>(null);

  const chatsByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const chat of chats) {
      map.set(chat.accountId, (map.get(chat.accountId) ?? 0) + 1);
    }
    return map;
  }, [chats]);

  const contactsByAccount = useMemo(() => {
    const map = new Map<string, number>();
    for (const contact of contacts) {
      map.set(contact.accountId, (map.get(contact.accountId) ?? 0) + 1);
    }
    return map;
  }, [contacts]);

  const connectedCount = accounts.filter((account) => account.status === 'connected').length;

  const sync = (account: Account) => {
    setAccountStatus(account.id, 'syncing', 'Синхронизация…');
    notify({
      title: 'Синхронизация запущена',
      description: `${account.displayName} · ${account.server}`,
    });
    window.setTimeout(() => {
      setAccountStatus(account.id, 'connected', 'только что');
      notify({
        title: 'Синхронизация завершена',
        description: `${account.displayName} обновлён.`,
        tone: 'success',
      });
    }, 1300);
  };

  const disconnect = (account: Account) => {
    setAccountStatus(account.id, 'disconnected', 'отключено вручную');
    notify({
      title: 'Аккаунт отключён',
      description: `${account.displayName} больше не синхронизируется.`,
      tone: 'warning',
    });
  };

  const connect = (account: Account) => {
    setAccountStatus(account.id, 'syncing', 'Подключение…');
    notify({
      title: 'Подключение',
      description: `Устанавливаем соединение с ${account.server}…`,
    });
    window.setTimeout(() => {
      setAccountStatus(account.id, 'connected', 'только что');
      notify({
        title: 'Аккаунт подключён',
        description: `${account.displayName} снова доступен.`,
        tone: 'success',
      });
    }, 1400);
  };

  const copyHandle = async (account: Account) => {
    try {
      await navigator.clipboard.writeText(account.handle);
      notify({ title: 'Адрес скопирован', description: account.handle, tone: 'success' });
    } catch {
      notify({
        title: 'Не удалось скопировать',
        description: 'Буфер обмена недоступен в браузере.',
        tone: 'error',
      });
    }
  };

  const menuFor = (account: Account): MenuItem[] => [
    {
      id: 'sync',
      label:
        account.status === 'error' || account.status === 'disconnected'
          ? 'Переподключить'
          : 'Синхронизировать',
      icon: <RefreshCw size={16} />,
      disabled: account.status === 'syncing',
      onSelect: () =>
        account.status === 'error' || account.status === 'disconnected'
          ? connect(account)
          : sync(account),
    },
    {
      id: 'copy',
      label: 'Скопировать адрес',
      icon: <Copy size={16} />,
      onSelect: () => copyHandle(account),
    },
    {
      id: 'settings',
      label: `Настройки ${protocolLabel(account.protocol)}`,
      icon: <Settings2 size={16} />,
      onSelect: () =>
        navigate(account.protocol === 'matrix' ? '/settings/matrix' : '/settings/xmpp'),
    },
    {
      id: 'toggle',
      label:
        account.status === 'disconnected' || account.status === 'error'
          ? 'Подключить'
          : 'Отключить',
      icon:
        account.status === 'disconnected' || account.status === 'error' ? (
          <Wifi size={16} />
        ) : (
          <Unplug size={16} />
        ),
      separatorBefore: true,
      onSelect: () =>
        account.status === 'disconnected' || account.status === 'error'
          ? connect(account)
          : disconnect(account),
    },
    {
      id: 'remove',
      label: 'Удалить аккаунт',
      icon: <Trash2 size={16} />,
      danger: true,
      onSelect: () => setRemoveTarget(account),
    },
  ];

  return (
    <div className="page accounts-page">
      <PageHeader
        title="Подключённые аккаунты"
        subtitle={
          <>
            <span>{accounts.length} {pluralizeRu(accounts.length, ['аккаунт', 'аккаунта', 'аккаунтов'])}</span>
            <span className="page-header__dot">·</span>
            <span>{connectedCount} в сети</span>
            <span className="page-header__dot">·</span>
            <span>Matrix и XMPP</span>
          </>
        }
        actions={
          <Button variant="filled" icon={<Plus size={17} />} onClick={() => setAddOpen(true)}>
            Добавить аккаунт
          </Button>
        }
      />

      <div className="page-scroll">
        <div className="page-container">
          {accounts.length === 0 ? (
            <EmptyState
              icon={<Link2 size={28} />}
              title="Нет подключённых аккаунтов"
              description="Добавьте аккаунт Matrix или XMPP, чтобы Messthon объединил ваши переписки."
              action={
                <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
                  Добавить первый аккаунт
                </Button>
              }
            />
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <h2>Аккаунты</h2>
                  <p>Каждая переписка остаётся привязанной к своему аккаунту.</p>
                </div>
              </div>

              <div className="accounts-grid">
                {accounts.map((account) => {
                  const chatCount = chatsByAccount.get(account.id) ?? 0;
                  const contactCount = contactsByAccount.get(account.id) ?? 0;
                  const isSyncing = account.status === 'syncing';
                  const isOffline =
                    account.status === 'error' || account.status === 'disconnected';
                  return (
                    <article
                      className={cn(
                        'account-card',
                        account.status === 'error' && 'account-card--error',
                      )}
                      key={account.id}
                    >
                      <header className="account-card__header">
                        <Avatar
                          name={account.displayName}
                          tone={account.tone}
                          size={46}
                          protocol={account.protocol}
                        />
                        <div className="account-card__identity">
                          <div className="account-card__name-row">
                            <h3>{account.displayName}</h3>
                            <ProtocolBadge protocol={account.protocol} />
                          </div>
                          <span className="account-card__handle">{account.handle}</span>
                        </div>
                        <ActionMenu
                          items={menuFor(account)}
                          label={`Управление аккаунтом ${account.displayName}`}
                          size="sm"
                        />
                      </header>

                      <div className="account-card__status-row">
                        <StatusChip status={account.status} />
                        <span className="account-card__sync">
                          {isSyncing ? (
                            <>
                              <LoaderCircle size={13} className="spin" /> Синхронизация
                            </>
                          ) : isOffline ? (
                            <>
                              <WifiOff size={13} /> Последняя синхронизация: {account.lastSync}
                            </>
                          ) : (
                            <>
                              <Wifi size={13} /> Синхронизировано: {account.lastSync}
                            </>
                          )}
                        </span>
                      </div>

                      {isOffline && (
                        <div className="account-card__notice">
                          <AlertTriangle size={15} />
                          <span>{account.statusDetail}</span>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => connect(account)}
                          >
                            Подключить
                          </Button>
                        </div>
                      )}

                      <div className="account-card__details">
                        <div>
                          <span>
                            <Server size={14} /> Сервер
                          </span>
                          <strong>{account.server}</strong>
                        </div>
                        <div>
                          <span>
                            <ShieldCheck size={14} /> Шифрование
                          </span>
                          <strong>{account.encryptionLabel}</strong>
                        </div>
                        <div>
                          <span>Устройство</span>
                          <strong>{account.deviceLabel}</strong>
                        </div>
                        <div>
                          <span>Данные</span>
                          <strong>
                            {chatCount}{' '}
                            {pluralizeRu(chatCount, ['переписка', 'переписки', 'переписок'])} ·{' '}
                            {contactCount}{' '}
                            {pluralizeRu(contactCount, ['контакт', 'контакта', 'контактов'])}
                          </strong>
                        </div>
                      </div>

                      <footer className="account-card__footer">
                        <Button
                          variant="tonal"
                          size="sm"
                          icon={
                            isSyncing ? (
                              <LoaderCircle size={15} className="spin" />
                            ) : (
                              <RefreshCw size={15} />
                            )
                          }
                          disabled={isSyncing}
                          onClick={() => (isOffline ? connect(account) : sync(account))}
                        >
                          {isOffline ? 'Переподключить' : isSyncing ? 'Синхронизация…' : 'Синхронизировать'}
                        </Button>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() =>
                            navigate(
                              account.protocol === 'matrix'
                                ? '/settings/matrix'
                                : '/settings/xmpp',
                            )
                          }
                        >
                          <Settings2 size={14} />
                          Настройки {protocolLabel(account.protocol)}
                        </button>
                      </footer>
                    </article>
                  );
                })}
              </div>

              <div className="section-heading section-heading--spaced">
                <div>
                  <h2>Протоколы</h2>
                  <p>Специфические настройки и состояние подключений.</p>
                </div>
              </div>
              <div className="protocol-overview">
                {(['matrix', 'xmpp'] as const).map((protocol) => {
                  const protocolAccounts = accounts.filter(
                    (account) => account.protocol === protocol,
                  );
                  const online = protocolAccounts.filter(
                    (account) => account.status === 'connected',
                  ).length;
                  return (
                    <article className="protocol-overview__item" key={protocol}>
                      <div className="protocol-overview__identity">
                        <ProtocolBadge protocol={protocol} />
                        <div>
                          <h3>{protocol === 'matrix' ? 'Федеративная сеть' : 'Открытый стандарт'}</h3>
                          <p>
                            {protocol === 'matrix'
                              ? 'Комнаты, Spaces, Megolm и проверка устройств.'
                              : 'JID, MUC, присутствие, ресурсы и OMEMO.'}
                          </p>
                        </div>
                      </div>
                      <div className="protocol-overview__meta">
                        <span>
                          {protocolAccounts.length}{' '}
                          {pluralizeRu(protocolAccounts.length, ['аккаунт', 'аккаунта', 'аккаунтов'])}
                        </span>
                        <span className={online === protocolAccounts.length ? 'is-online' : ''}>
                          {online} активно
                        </span>
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() =>
                          navigate(protocol === 'matrix' ? '/settings/matrix' : '/settings/xmpp')
                        }
                      >
                        Настройки
                      </Button>
                    </article>
                  );
                })}
              </div>

              <div className="page-note">
                <ShieldCheck size={16} />
                <span>
                  Прототип не выполняет сетевых подключений. Аккаунты, синхронизация и
                  статусы хранятся в локальном состоянии интерфейса.
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <AddAccountModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Удалить аккаунт?"
        description="Действие удалит демонстрационные переписки и контакты этого аккаунта из Messthon."
        size="sm"
        footer={
          <>
            <Button variant="text" onClick={() => setRemoveTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => {
                if (!removeTarget) return;
                removeAccount(removeTarget.id);
                notify({
                  title: 'Аккаунт удалён',
                  description: `${removeTarget.displayName} и связанные переписки удалены.`,
                  tone: 'success',
                });
                setRemoveTarget(null);
              }}
            >
              Удалить
            </Button>
          </>
        }
      >
        <div className="remove-account-summary">
          <Avatar
            name={removeTarget?.displayName ?? 'Аккаунт'}
            tone={removeTarget?.tone ?? 0}
            size={40}
            protocol={removeTarget?.protocol}
          />
          <div>
            <strong>{removeTarget?.displayName}</strong>
            <span>{removeTarget?.handle}</span>
          </div>
        </div>
        <p className="modal-warning">
          Связанные переписки ({chatsByAccount.get(removeTarget?.id ?? '') ?? 0}) и контакты
          будут удалены из демонстрационной ленты. Это действие не затрагивает реальный
          аккаунт.
        </p>
      </Modal>
    </div>
  );
}
