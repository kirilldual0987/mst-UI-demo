import {
  Check,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Sun,
  Type,
  UnfoldVertical,
} from 'lucide-react';
import type { AccentId, Density, FontSize, ThemeMode } from '../../../types';
import { useApp } from '../../../state/AppContext';
import { useUi } from '../../../state/UiContext';
import {
  Button,
} from '../../ui/Button';
import {
  SegmentedControl,
  ToggleRow,
} from '../../ui/Badge';
import { SettingsGroup, SettingsIntro, SettingsNotice, SettingsRow } from '../SettingsPrimitives';

const ACCENTS: Array<{ id: AccentId; label: string; color: string }> = [
  { id: 'jade', label: 'Нефритовый', color: '#0e7a4a' },
  { id: 'teal', label: 'Бирюзовый', color: '#0b6b70' },
  { id: 'indigo', label: 'Индиго', color: '#435fa8' },
  { id: 'terracotta', label: 'Терракота', color: '#98513b' },
];

export function AppearanceSettings() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Внешний вид"
        description="Тема, акцентный цвет и плотность интерфейса. Изменения применяются сразу и сохраняются на устройстве."
      />

      <SettingsGroup title="Тема" description="Светлая, тёмная или системная.">
        <div className="theme-selector">
          <SegmentedControl<ThemeMode>
            label="Тема оформления"
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
            options={[
              { value: 'light', label: 'Светлая', icon: <Sun size={16} /> },
              { value: 'dark', label: 'Тёмная', icon: <Moon size={16} /> },
              { value: 'system', label: 'Системная', icon: <Monitor size={16} /> },
            ]}
          />
        </div>
        <div className="theme-note">
          <Palette size={16} />
          <span>
            Messthon использует нейтральные поверхности и один акцентный цвет — без
            градиентов и лишних декоративных эффектов.
          </span>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Акцентный цвет"
        description="Основной цвет действий, фокуса и активных состояний."
      >
        <div className="accent-picker" role="group" aria-label="Акцентный цвет">
          {ACCENTS.map((accent) => (
            <button
              type="button"
              key={accent.id}
              className={`accent-option ${settings.accent === accent.id ? 'is-selected' : ''}`}
              aria-pressed={settings.accent === accent.id}
              onClick={() => updateSettings({ accent: accent.id })}
            >
              <span
                className="accent-option__swatch"
                style={{ backgroundColor: accent.color }}
                aria-hidden="true"
              >
                {settings.accent === accent.id && <Check size={14} />}
              </span>
              <span>{accent.label}</span>
            </button>
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Типографика и плотность">
        <SettingsRow title="Размер интерфейса" description="Масштаб текста и элементов.">
          <SegmentedControl<FontSize>
            label="Размер интерфейса"
            compact
            value={settings.fontSize}
            onChange={(fontSize) => updateSettings({ fontSize })}
            options={[
              { value: 'small', label: 'Мелкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'large', label: 'Крупный' },
            ]}
          />
        </SettingsRow>
        <SettingsRow title="Плотность" description="Количество воздуха в списках и карточках.">
          <SegmentedControl<Density>
            label="Плотность интерфейса"
            compact
            value={settings.density}
            onChange={(density) => updateSettings({ density })}
            options={[
              { value: 'comfortable', label: 'Комфортная', icon: <UnfoldVertical size={15} /> },
              { value: 'compact', label: 'Компактная' },
            ]}
          />
        </SettingsRow>
        <SettingsRow title="Базовый размер" description="Текущий базовый размер текста.">
          <span className="settings-value">
            <Type size={15} />
            {settings.fontSize === 'small'
              ? '15 px'
              : settings.fontSize === 'large'
                ? '17 px'
                : '16 px'}
          </span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup>
        <ToggleRow
          title="Уменьшить движение"
          description="Отключить плавные переходы в интерфейсе."
          checked={settings.reduceMotion}
          onChange={(reduceMotion) => updateSettings({ reduceMotion })}
        />
      </SettingsGroup>

      <div className="settings-actions">
        <Button
          variant="text"
          icon={<RotateCcw size={16} />}
          onClick={() =>
            updateSettings({
              theme: 'system',
              accent: 'jade',
              fontSize: 'medium',
              density: 'comfortable',
              reduceMotion: false,
            })
          }
        >
          Сбросить оформление
        </Button>
      </div>
    </div>
  );
}

export function InterfaceSettings() {
  const { settings, updateSettings } = useApp();
  return (
    <div className="settings-section">
      <SettingsIntro
        title="Интерфейс"
        description="Рабочее пространство мессенджера и видимость вторичных элементов."
      />

      <SettingsGroup title="Боковые панели">
        <ToggleRow
          title="Панель информации при открытии чата"
          description="Показывать сведения об аккаунте, участниках и безопасности справа."
          checked={settings.showInfoPanel}
          onChange={(showInfoPanel) => updateSettings({ showInfoPanel })}
        />
        <ToggleRow
          title="Названия протоколов в списке"
          description="Показывать текст Matrix или XMPP рядом с иконкой протокола."
          checked={settings.showProtocolLabels}
          onChange={(showProtocolLabels) => updateSettings({ showProtocolLabels })}
        />
      </SettingsGroup>

      <SettingsGroup title="Движение">
        <ToggleRow
          title="Плавные переходы"
          description="Анимации открытия панелей и появления сообщений."
          checked={!settings.reduceMotion}
          onChange={(value) => updateSettings({ reduceMotion: !value })}
        />
        <SettingsNotice>
          Настройка «Уменьшить движение» также учитывает системную настройку
          доступности браузера.
        </SettingsNotice>
      </SettingsGroup>

      <SettingsGroup title="Горячие клавиши">
        <SettingsRow
          title="Быстрый поиск"
          description="Открывается сочетанием ⌘K или Ctrl+K в любой части приложения."
        >
          <kbd className="shortcut-key">⌘ K</kbd>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

export function MessagesSettings() {
  const { settings, updateSettings } = useApp();
  const { notify } = useUi();
  return (
    <div className="settings-section">
      <SettingsIntro
        title="Сообщения"
        description="Поведение поля ввода и отображение состояний переписки."
      />

      <SettingsGroup title="Ввод и отправка">
        <ToggleRow
          title="Отправлять по Enter"
          description="Shift+Enter вставляет новую строку. Если выключено, отправка — ⌘Enter или Ctrl+Enter."
          checked={settings.enterToSend}
          onChange={(enterToSend) => updateSettings({ enterToSend })}
        />
        <ToggleRow
          title="Показывать индикатор набора"
          description="Отображать, когда собеседник печатает сообщение."
          checked={settings.typingIndicators}
          onChange={(typingIndicators) => updateSettings({ typingIndicators })}
        />
      </SettingsGroup>

      <SettingsGroup title="Статусы и квитанции">
        <ToggleRow
          title="Отправлять квитанции о прочтении"
          description="Доступно только для протоколов, которые поддерживают эту функцию."
          checked={settings.sendReadReceipts}
          onChange={(sendReadReceipts) => updateSettings({ sendReadReceipts })}
        />
        <SettingsNotice>
          XMPP-аккаунты в Messthon показывают статус доставки. Квитанции о прочтении
          отображаются только для Matrix, где они предусмотрены протоколом.
        </SettingsNotice>
      </SettingsGroup>

      <SettingsGroup title="Демонстрационные данные">
        <SettingsRow
          title="Проверить форматирование"
          description="Отправить тестовое сообщение в активный чат."
        >
          <Button
            variant="outlined"
            size="sm"
            onClick={() =>
              notify({
                title: 'Демонстрационное сообщение',
                description: 'Откройте чат и отправьте сообщение из поля ввода.',
              })
            }
          >
            Проверить
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
