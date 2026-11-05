import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  Layers3,
  Plus,
  Settings2,
} from 'lucide-react';
import type { Account } from '../../../types';
import { useApp } from '../../../state/AppContext';
import { useUi } from '../../../state/UiContext';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { ProtocolBadge, StatusChip, ToggleRow } from '../../ui/Badge';
import { SettingsGroup, SettingsIntro, SettingsNotice } from '../SettingsPrimitives';

export function AccountsSettings() {
  const { accounts } = useApp();
  const navigate = useNavigate();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Аккаунты"
        description="Идентичности, подключённые к Messthon. Управление сессиями и синхронизацией — на отдельной странице."
        action={
          <Button
            variant="outlined"
            size="sm"
            icon={<Layers3 size={15} />}
            onClick={() => navigate('/accounts')}
          >
            Управление
          </Button>
        }
      />

      <SettingsGroup title="Подключённые аккаунты">
        <div className="settings-account-list">
          {accounts.map((account) => (
            <button
              type="button"
              key={account.id}
              className="settings-account-row"
              onClick={() => navigate('/accounts')}
            >
              <Avatar
                name={account.displayName}
                tone={account.tone}
                size={36}
                protocol={account.protocol}
              />
              <span className="settings-account-row__copy">
                <strong>{account.displayName}</strong>
                <span>{account.handle}</span>
              </span>
              <ProtocolBadge protocol={account.protocol} />
              <StatusChip status={account.status} />
            </button>
          ))}
        </div>
      </SettingsGroup>

      <div className="settings-actions">
        <Button
          variant="filled"
          icon={<Plus size={16} />}
          onClick={() => navigate('/accounts')}
        >
          Добавить аккаунт
        </Button>
        <Button
          variant="text"
          icon={<Settings2 size={16} />}
          onClick={() => navigate('/accounts')}
        >
          Все настройки аккаунтов
        </Button>
      </div>
    </div>
  );
}

export function ProtocolsSettings() {
  const { accounts, chats } = useApp();
  const navigate = useNavigate();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Протоколы"
        description="Matrix и XMPP работают независимо. Их возможности, состояние и безопасность не смешиваются в общем интерфейсе."
      />

      <div className="protocol-settings-list">
        {(
          [
            {
              protocol: 'matrix' as const,
              title: 'Matrix',
              description:
                'Федеративная сеть: комнаты, Spaces, Megolm и проверка устройств.',
              capabilities: 'Комнаты · Spaces · E2EE',
            },
            {
              protocol: 'xmpp' as const,
              title: 'XMPP',
              description:
                'Открытый протокол: JID, MUC, присутствие, ресурсы и OMEMO.',
              capabilities: 'JID · MUC · OMEMO',
            },
          ]
        ).map((item) => {
          const protocolAccounts = accounts.filter(
            (account) => account.protocol === item.protocol,
          );
          const chatCount = chats.filter((chat) => chat.protocol === item.protocol).length;
          const online = protocolAccounts.filter(
            (account) => account.status === 'connected',
          ).length;
          return (
            <article className="protocol-settings-card" key={item.protocol}>
              <header>
                <ProtocolBadge protocol={item.protocol} />
                <span className="protocol-settings-card__health">
                  <span className={online === protocolAccounts.length ? 'is-online' : ''} />
                  {online} из {protocolAccounts.length} подключено
                </span>
              </header>
              <h3>{item.description}</h3>
              <p>{item.capabilities}</p>
              <div className="protocol-settings-card__facts">
                <span>{chatCount} переписок</span>
                <span>{protocolAccounts.length} аккаунта</span>
              </div>
              <Button
                variant="outlined"
                size="sm"
                onClick={() =>
                  navigate(item.protocol === 'matrix' ? '/settings/matrix' : '/settings/xmpp')
                }
              >
                Настроить {item.title}
              </Button>
            </article>
          );
        })}
      </div>

      <SettingsNotice>
        Протокольные адаптеры подключаются отдельно. Messthon не изображает функции
        Matrix как доступные в XMPP и наоборот.
      </SettingsNotice>
    </div>
  );
}

function AccountNotificationPreview({ accounts }: { accounts: Account[] }) {
  return (
    <div className="notification-preview">
      <div className="notification-preview__header">
        <span>
          <Bell size={15} /> Messthon
        </span>
        <span>сейчас</span>
      </div>
      <strong>Новое сообщение · Alina Morozova</strong>
      <p>Финальную сетку приложила. Сделала зелёный спокойнее.</p>
      <span className="notification-preview__account">
        через {accounts[0]?.displayName ?? 'аккаунт Matrix'}
      </span>
    </div>
  );
}

export function NotificationsSettings() {
  const { settings, updateSettings, accounts } = useApp();
  const { notify } = useUi();
  const disabled = !settings.notificationsEnabled;

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Уведомления"
        description="Как Messthon сообщает о новых сообщениях и упоминаниях."
        action={
          <Button
            variant="outlined"
            size="sm"
            icon={<BellRing size={15} />}
            onClick={() =>
              notify({
                title: settings.messagePreviews
                  ? 'Alina Morozova'
                  : 'Новое сообщение',
                description: settings.messagePreviews
                  ? 'Финальную сетку приложила. Сделала зелёный спокойнее.'
                  : 'Текст уведомления скрыт. Откройте Messthon, чтобы прочитать.',
                tone: 'neutral',
              })
            }
          >
            Проверить
          </Button>
        }
      />

      <SettingsGroup>
        <ToggleRow
          title="Уведомления приложения"
          description="Показывать новые сообщения во всех подключённых аккаунтах."
          checked={settings.notificationsEnabled}
          onChange={(notificationsEnabled) => updateSettings({ notificationsEnabled })}
        />
        <ToggleRow
          title="Звук"
          description="Короткий звук для входящих сообщений."
          checked={settings.notificationSound}
          onChange={(notificationSound) => updateSettings({ notificationSound })}
          disabled={disabled}
        />
        <ToggleRow
          title="Показывать превью"
          description="Текст сообщения и имя отправителя в уведомлении."
          checked={settings.messagePreviews}
          onChange={(messagePreviews) => updateSettings({ messagePreviews })}
          disabled={disabled}
        />
        <ToggleRow
          title="Только упоминания"
          description="Не отвлекать на сообщения без упоминаний в группах и комнатах."
          checked={settings.mentionsOnly}
          onChange={(mentionsOnly) => updateSettings({ mentionsOnly })}
          disabled={disabled}
        />
        <ToggleRow
          title="Тихие часы"
          description="Приостанавливать уведомления с 22:00 до 08:00."
          checked={settings.quietHours}
          onChange={(quietHours) => updateSettings({ quietHours })}
          disabled={disabled}
        />
      </SettingsGroup>

      <SettingsGroup title="Предпросмотр">
        <AccountNotificationPreview accounts={accounts} />
        <SettingsNotice>
          В прототипе уведомление отображается внутри приложения. Системные push-уведомления
          появятся после подключения платформенного слоя.
        </SettingsNotice>
      </SettingsGroup>
    </div>
  );
}
