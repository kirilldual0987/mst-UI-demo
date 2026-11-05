import {
  Download,
  EyeOff,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  UserX,
} from 'lucide-react';
import { useApp } from '../../../state/AppContext';
import { useUi } from '../../../state/UiContext';
import { Button } from '../../ui/Button';
import { ProtocolBadge, ToggleRow } from '../../ui/Badge';
import { SettingsGroup, SettingsIntro, SettingsNotice, SettingsRow, SettingsSelect } from '../SettingsPrimitives';

export function PrivacySettings() {
  const { settings, updateSettings } = useApp();
  const { notify } = useUi();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Приватность"
        description="Какие данные о вашей активности видны другим участникам."
      />

      <SettingsGroup title="Видимость">
        <ToggleRow
          title="Делиться присутствием"
          description="Показывать контактам, что вы в сети. Для XMPP это отражается в статусе ресурса."
          checked={settings.sharePresence}
          onChange={(sharePresence) => updateSettings({ sharePresence })}
        />
        <ToggleRow
          title="Индикатор набора"
          description="Позволять собеседникам видеть, когда вы печатаете."
          checked={settings.typingIndicators}
          onChange={(typingIndicators) => updateSettings({ typingIndicators })}
        />
        <ToggleRow
          title="Квитанции о прочтении"
          description="Отправлять статус прочтения там, где протокол это поддерживает."
          checked={settings.sendReadReceipts}
          onChange={(sendReadReceipts) => updateSettings({ sendReadReceipts })}
        />
      </SettingsGroup>

      <SettingsGroup title="Блокировки">
        <div className="blocked-empty">
          <span className="blocked-empty__icon">
            <UserX size={18} />
          </span>
          <div>
            <strong>Нет заблокированных контактов</strong>
            <span>Заблокированные пользователи не смогут писать вам в Messthon.</span>
          </div>
          <Button
            variant="text"
            size="sm"
            onClick={() =>
              notify({
                title: 'Управление блокировками',
                description: 'Список блокировок синхронизируется с протокольными адаптерами.',
              })
            }
          >
            Управление
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Данные">
        <SettingsRow
          title="Экспорт данных"
          description="Скачать профиль, контакты и список переписок в демонстрационном формате."
        >
          <Button
            variant="outlined"
            size="sm"
            icon={<Download size={15} />}
            onClick={() =>
              notify({
                title: 'Экспорт данных',
                description: 'Файл экспорта будет доступен в полной версии приложения.',
              })
            }
          >
            Экспортировать
          </Button>
        </SettingsRow>
        <SettingsNotice>
          В прототипе локальные данные не покидают браузер. Экспорт подготовлен как точка
          интеграции с будущим слоем хранения.
        </SettingsNotice>
      </SettingsGroup>
    </div>
  );
}

export function SecuritySettings() {
  const { settings, updateSettings } = useApp();
  const { notify } = useUi();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Безопасность"
        description="Доступ к приложению и активные сессии устройства."
      />

      <SettingsGroup title="Блокировка приложения">
        <ToggleRow
          title="Блокировать Messthon"
          description="Запрашивать локальную блокировку при возвращении к приложению."
          checked={settings.appLock}
          onChange={(appLock) => updateSettings({ appLock })}
        />
        <SettingsRow title="Автоблокировка" description="Через сколько минут бездействия.">
          <SettingsSelect
            label="Время автоблокировки"
            value={String(settings.autoLockMinutes)}
            onChange={(value) => updateSettings({ autoLockMinutes: Number(value) })}
            options={[
              { value: '1', label: '1 минута' },
              { value: '5', label: '5 минут' },
              { value: '15', label: '15 минут' },
              { value: '60', label: '1 час' },
            ]}
          />
        </SettingsRow>
        <SettingsNotice>
          В веб-прототипе блокировка настраивается, но системный экран блокировки появится в
          нативном клиенте.
        </SettingsNotice>
      </SettingsGroup>

      <SettingsGroup title="Активные сессии">
        <div className="session-list">
          <div className="session-row">
            <span className="session-row__icon">
              <Laptop size={18} />
            </span>
            <div>
              <strong>MacBook Pro · это устройство</strong>
              <span>Messthon Web · Санкт-Петербург · сейчас</span>
            </div>
            <span className="session-row__current">Текущая</span>
          </div>
          <div className="session-row">
            <span className="session-row__icon">
              <Smartphone size={18} />
            </span>
            <div>
              <strong>iPhone 15</strong>
              <span>Messthon iOS · 2 дня назад</span>
            </div>
            <Button
              variant="text"
              size="sm"
              icon={<LogOut size={14} />}
              onClick={() =>
                notify({
                  title: 'Сессия завершена',
                  description: 'Демонстрационная мобильная сессия удалена из списка.',
                  tone: 'success',
                })
              }
            >
              Завершить
            </Button>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Дополнительно">
        <div className="security-feature-row">
          <span className="security-feature-row__icon">
            <KeyRound size={18} />
          </span>
          <div>
            <strong>Двухфакторная аутентификация</strong>
            <span>Дополнительная защита для будущих протокольных аккаунтов.</span>
          </div>
          <Button
            variant="outlined"
            size="sm"
            onClick={() =>
              notify({
                title: 'Двухфакторная аутентификация',
                description: 'Настройка появится после подключения реальной авторизации.',
              })
            }
          >
            Настроить
          </Button>
        </div>
        <div className="security-feature-row">
          <span className="security-feature-row__icon">
            <MonitorSmartphone size={18} />
          </span>
          <div>
            <strong>Проверка устройств</strong>
            <span>Ключи Matrix и OMEMO-сессии управляются в настройках протоколов.</span>
          </div>
          <Button
            variant="text"
            size="sm"
            onClick={() =>
              notify({
                title: 'Проверка устройств',
                description: 'Откройте настройки Matrix или XMPP, чтобы увидеть детали.',
              })
            }
          >
            Подробнее
          </Button>
        </div>
      </SettingsGroup>
    </div>
  );
}

export function EncryptionSettings() {
  const { settings, updateSettings } = useApp();
  const { notify } = useUi();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Шифрование"
        description="Сквозное шифрование Messthon работает через возможности каждого протокола."
      />

      <SettingsGroup title="Matrix">
        <div className="encryption-protocol-row">
          <ProtocolBadge protocol="matrix" />
          <span>Megolm / Olm</span>
        </div>
        <ToggleRow
          title="Шифровать новые комнаты"
          description="Включать E2EE по умолчанию при создании новых Matrix-комнат."
          checked={settings.defaultMatrixEncryption}
          onChange={(defaultMatrixEncryption) =>
            updateSettings({ defaultMatrixEncryption })
          }
        />
        <ToggleRow
          title="Резервная копия ключей"
          description="Хранить зашифрованную резервную копию ключей Matrix."
          checked={settings.keyBackup}
          onChange={(keyBackup) => updateSettings({ keyBackup })}
        />
        <SettingsRow
          title="Проверка ключей"
          description="В прототипе состояние ключей демонстрационное."
        >
          <Button
            variant="outlined"
            size="sm"
            icon={<ShieldCheck size={15} />}
            onClick={() =>
              notify({
                title: 'Ключи Matrix',
                description: 'Резервная копия актуальна. Все устройства проверены.',
                tone: 'success',
              })
            }
          >
            Проверить
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="XMPP">
        <div className="encryption-protocol-row">
          <ProtocolBadge protocol="xmpp" />
          <span>OMEMO 0.8</span>
        </div>
        <ToggleRow
          title="Включить OMEMO"
          description="Использовать OMEMO для новых личных диалогов XMPP."
          checked={settings.omemoEnabled}
          onChange={(omemoEnabled) => updateSettings({ omemoEnabled })}
        />
        <SettingsRow
          title="Идентификатор устройства OMEMO"
          description="Публикуется в XMPP для доверия собеседников."
        >
          <span className="settings-value settings-value--mono">
            <LockKeyhole size={14} /> 8f2c…a41d
          </span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsNotice tone="warning">
        Ключи и устройства Matrix и XMPP независимы. Отключение шифрования в одном
        протоколе не влияет на другой.
      </SettingsNotice>

      <SettingsGroup title="Локальное хранилище">
        <SettingsRow
          title="Шифрование локальных данных"
          description="Локальные демонстрационные данные не содержат реальных сообщений."
        >
          <span className="settings-value">
            <EyeOff size={14} /> Только браузер
          </span>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
