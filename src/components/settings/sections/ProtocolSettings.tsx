import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Grid2X2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../state/AppContext';
import { useUi } from '../../../state/UiContext';
import { cn } from '../../../lib/cn';
import { Avatar } from '../../ui/Avatar';
import { ProtocolBadge, StatusChip, ToggleRow } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  SettingsGroup,
  SettingsIntro,
  SettingsNotice,
  SettingsRow,
  SettingsSelect,
} from '../SettingsPrimitives';

function AccountProtocolRows({ protocol }: { protocol: 'matrix' | 'xmpp' }) {
  const { accounts } = useApp();
  const filtered = accounts.filter((account) => account.protocol === protocol);
  return (
    <div className="protocol-account-list">
      {filtered.map((account) => (
        <div className="protocol-account-row" key={account.id}>
          <Avatar
            name={account.displayName}
            tone={account.tone}
            size={36}
            protocol={account.protocol}
          />
          <div className="protocol-account-row__copy">
            <strong>{account.displayName}</strong>
            <span>{account.handle}</span>
          </div>
          <div className="protocol-account-row__server">
            <Server size={14} />
            <span>{account.server}</span>
          </div>
          <StatusChip status={account.status} />
        </div>
      ))}
    </div>
  );
}

export function MatrixSettings() {
  const { settings, updateSettings, chats, accounts, setAccountStatus } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const matrixChats = chats.filter((chat) => chat.protocol === 'matrix');
  const matrixAccounts = accounts.filter((account) => account.protocol === 'matrix');
  const roomCount = matrixChats.filter(
    (chat) => chat.kind === 'room' || chat.kind === 'space',
  ).length;
  const firstAccount = matrixAccounts[0];

  const checkDevices = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      notify({
        title: 'Устройства Matrix проверены',
        description: 'Все ключи устройств в демонстрационной сессии актуальны.',
        tone: 'success',
      });
    }, 900);
  };

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Matrix"
        description="Homeserver, комнаты, Spaces и безопасность Matrix. Настройки применяются только к этому протоколу."
        action={
          <Button
            variant="outlined"
            size="sm"
            onClick={() => navigate('/accounts')}
            trailingIcon={<ArrowRight size={15} />}
          >
            Управление аккаунтами
          </Button>
        }
      />

      <div className="protocol-identity">
        <span className="protocol-identity__icon protocol-identity__icon--matrix">
          <Grid2X2 size={24} />
        </span>
        <div>
          <div className="protocol-identity__title">
            <h3>Matrix</h3>
            <ProtocolBadge protocol="matrix" />
          </div>
          <p>
            {matrixAccounts.length} аккаунта · {matrixChats.length} переписок ·{' '}
            {roomCount} комнат и пространств
          </p>
        </div>
        <span className="protocol-identity__secure">
          <LockKeyhole size={14} /> Megolm / Olm
        </span>
      </div>

      <SettingsGroup title="Аккаунты Matrix">
        <AccountProtocolRows protocol="matrix" />
        {firstAccount && (
          <SettingsRow
            title="Homeserver текущего аккаунта"
            description={firstAccount.displayName}
          >
            <span className="settings-value settings-value--mono">{firstAccount.server}</span>
          </SettingsRow>
        )}
      </SettingsGroup>

      <SettingsGroup
        title="Шифрование и ключи"
        description="Функции безопасности Matrix не влияют на XMPP-аккаунты."
      >
        <ToggleRow
          title="Шифровать новые комнаты"
          description="Включать сквозное шифрование Megolm по умолчанию."
          checked={settings.defaultMatrixEncryption}
          onChange={(defaultMatrixEncryption) =>
            updateSettings({ defaultMatrixEncryption })
          }
        />
        <ToggleRow
          title="Резервная копия ключей"
          description="Синхронизировать ключи между устройствами Matrix."
          checked={settings.keyBackup}
          onChange={(keyBackup) => updateSettings({ keyBackup })}
        />
        <SettingsRow
          title="Проверка устройств"
          description="Ключи текущей сессии и доверенные устройства."
        >
          <Button
            variant="outlined"
            size="sm"
            icon={checking ? <LoaderCircle size={15} className="spin" /> : <ShieldCheck size={15} />}
            loading={checking}
            onClick={checkDevices}
          >
            Проверить
          </Button>
        </SettingsRow>
        <SettingsRow title="Экспорт ключей" description="Зашифрованный архив для восстановления.">
          <Button
            variant="text"
            size="sm"
            icon={<KeyRound size={15} />}
            onClick={() =>
              notify({
                title: 'Экспорт ключей Matrix',
                description: 'В демонстрационном режиме ключи не создаются и не экспортируются.',
              })
            }
          >
            Экспортировать
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Комнаты и Spaces">
        <SettingsRow
          title="Комнаты и пространства"
          description="Комнаты, в которых состоит текущий Matrix-аккаунт."
        >
          <Button variant="text" size="sm" onClick={() => navigate('/rooms')}>
            Открыть {roomCount} комнат
          </Button>
        </SettingsRow>
        <SettingsRow
          title="Темы комнат"
          description="Отображать тему комнаты в заголовке и информационной панели."
        >
          <span className="settings-value">
            <CheckCircle2 size={14} /> Включено
          </span>
        </SettingsRow>
        <SettingsRow
          title="Права доступа"
          description="Управление правами доступно администраторам комнат."
        >
          <Button
            variant="text"
            size="sm"
            onClick={() =>
              notify({
                title: 'Права доступа Matrix',
                description: 'Управление правами комнаты появится после интеграции Matrix SDK.',
              })
            }
          >
            Подробнее
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Соединение">
        <div className="session-list">
          {matrixAccounts.map((account) => (
            <div className="session-row" key={account.id}>
              <span className="session-row__icon">
                {account.status === 'syncing' ? (
                  <LoaderCircle size={18} className="spin" />
                ) : (
                  <Smartphone size={18} />
                )}
              </span>
              <div>
                <strong>{account.displayName}</strong>
                <span>{account.deviceLabel}</span>
              </div>
              <Button
                variant="text"
                size="sm"
                icon={<RefreshCw size={14} />}
                disabled={account.status === 'syncing'}
                onClick={() => {
                  setAccountStatus(account.id, 'syncing', 'Синхронизация…');
                  window.setTimeout(() => {
                    setAccountStatus(account.id, 'connected', 'только что');
                    notify({
                      title: 'Matrix синхронизирован',
                      description: account.displayName,
                      tone: 'success',
                    });
                  }, 1000);
                }}
              >
                Синхронизировать
              </Button>
            </div>
          ))}
        </div>
      </SettingsGroup>

      <SettingsNotice>
        Matrix ID, homeserver и ключи относятся только к Matrix. Messthon не показывает их
        как общие свойства XMPP-аккаунтов.
      </SettingsNotice>
    </div>
  );
}

export function XmppSettings() {
  const { settings, updateSettings, accounts, chats } = useApp();
  const { notify } = useUi();
  const navigate = useNavigate();
  const [priority, setPriority] = useState('10');
  const [checking, setChecking] = useState(false);
  const xmppAccounts = accounts.filter((account) => account.protocol === 'xmpp');
  const xmppChats = chats.filter((chat) => chat.protocol === 'xmpp');
  const mucCount = xmppChats.filter(
    (chat) => chat.kind === 'group' || chat.kind === 'room',
  ).length;
  const firstAccount = xmppAccounts[0];

  const checkConnection = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      notify({
        title: 'XMPP-соединение проверено',
        description: 'Ресурсы и OMEMO-сессии в демонстрационном режиме доступны.',
        tone: 'success',
      });
    }, 900);
  };

  return (
    <div className="settings-section">
      <SettingsIntro
        title="XMPP"
        description="JID, присутствие, ресурсы и OMEMO. Эти параметры не являются общими для Matrix."
        action={
          <Button
            variant="outlined"
            size="sm"
            onClick={() => navigate('/accounts')}
            trailingIcon={<ArrowRight size={15} />}
          >
            Управление аккаунтами
          </Button>
        }
      />

      <div className="protocol-identity">
        <span className="protocol-identity__icon protocol-identity__icon--xmpp">
          <Zap size={24} />
        </span>
        <div>
          <div className="protocol-identity__title">
            <h3>XMPP</h3>
            <ProtocolBadge protocol="xmpp" />
          </div>
          <p>
            {xmppAccounts.length} аккаунта · {xmppChats.length} переписок · {mucCount} MUC
          </p>
        </div>
        <span className="protocol-identity__secure">
          <LockKeyhole size={14} /> OMEMO 0.8
        </span>
      </div>

      <SettingsGroup title="Аккаунты XMPP">
        <AccountProtocolRows protocol="xmpp" />
        {firstAccount && (
          <SettingsRow title="JID текущего аккаунта" description={firstAccount.displayName}>
            <span className="settings-value settings-value--mono">{firstAccount.handle}</span>
          </SettingsRow>
        )}
      </SettingsGroup>

      <SettingsGroup title="OMEMO и безопасность">
        <ToggleRow
          title="Включить OMEMO"
          description="Использовать OMEMO для новых личных диалогов XMPP."
          checked={settings.omemoEnabled}
          onChange={(omemoEnabled) => updateSettings({ omemoEnabled })}
        />
        <SettingsRow
          title="Идентификатор устройства"
          description="Публикуется в XMPP для проверки ключей собеседниками."
        >
          <span className="settings-value settings-value--mono">
            <LockKeyhole size={14} /> 8f2c…a41d
          </span>
        </SettingsRow>
        <SettingsRow title="Состояние ключей" description="Локальные ключи демонстрационной сессии.">
          <Button
            variant="text"
            size="sm"
            icon={<ShieldCheck size={15} />}
            onClick={() =>
              notify({
                title: 'OMEMO',
                description: 'В прототипе OMEMO-ключи не генерируются. Интерфейс готов к интеграции.',
              })
            }
          >
            Управление ключами
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Присутствие и ресурсы">
        <ToggleRow
          title="Показывать присутствие"
          description="Сообщать контактам статус online, away или busy."
          checked={settings.sharePresence}
          onChange={(sharePresence) => updateSettings({ sharePresence })}
        />
        <SettingsRow title="Приоритет ресурса" description="Чем выше значение, тем предпочтительнее ресурс.">
          <SettingsSelect
            label="Приоритет ресурса XMPP"
            value={priority}
            onChange={(value) => {
              setPriority(value);
              notify({
                title: 'Приоритет ресурса обновлён',
                description: `Приоритет текущей демонстрационной сессии: ${value}.`,
                tone: 'success',
              });
            }}
            options={[
              { value: '0', label: '0 · низкий' },
              { value: '5', label: '5 · обычный' },
              { value: '10', label: '10 · высокий' },
            ]}
          />
        </SettingsRow>
        <SettingsRow title="Ресурсы" description="Подключённые устройства текущего аккаунта.">
          <span className="settings-value">
            {xmppAccounts[0]?.deviceLabel ?? 'Messthon Desktop'}
          </span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Групповые чаты MUC">
        <SettingsRow
          title="Конференции MUC"
          description="Групповые чаты XMPP, подключённые к Messthon."
        >
          <Button variant="text" size="sm" onClick={() => navigate('/rooms')}>
            Открыть {mucCount} MUC
          </Button>
        </SettingsRow>
        <SettingsRow
          title="История MUC"
          description="Загружать историю конференции при подключении."
        >
          <span className="settings-value">По умолчанию</span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Соединение">
        <SettingsRow title="Проверка соединения" description="Ping сервера и состояние ресурсов.">
          <Button
            variant="outlined"
            size="sm"
            icon={checking ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />}
            loading={checking}
            onClick={checkConnection}
          >
            Проверить
          </Button>
        </SettingsRow>
        <div className="session-list">
          {xmppAccounts.map((account) => (
            <div className="session-row" key={account.id}>
              <span className={cn('session-row__icon', account.status === 'error' && 'is-error')}>
                <Zap size={18} />
              </span>
              <div>
                <strong>{account.server}</strong>
                <span>{account.statusDetail}</span>
              </div>
              <StatusChip status={account.status} />
            </div>
          ))}
        </div>
      </SettingsGroup>

      <SettingsNotice>
        JID, MUC, ресурсы и OMEMO относятся только к XMPP. Matrix-функции отображаются в
        настройках Matrix.
      </SettingsNotice>
    </div>
  );
}
