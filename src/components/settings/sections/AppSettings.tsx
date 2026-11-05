import { useState } from 'react';
import {
  ChevronRight,
  CircleHelp,
  Download,
  FileArchive,
  HardDrive,
  Info,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { APP_VERSION } from '../../../lib/constants';
import { useApp } from '../../../state/AppContext';
import { useUi } from '../../../state/UiContext';
import { BrandMark } from '../../brand/Logo';
import { Button } from '../../ui/Button';
import { SettingsGroup, SettingsIntro, SettingsNotice, SettingsRow, SettingsSelect } from '../SettingsPrimitives';

export function StorageSettings() {
  const { settings, updateSettings } = useApp();
  const { notify } = useUi();
  const [cleared, setCleared] = useState(false);
  const [clearing, setClearing] = useState(false);

  const used = cleared ? 0 : 248;
  const breakdown = cleared
    ? { images: 0, files: 0, other: 0 }
    : { images: 184, files: 41, other: 23 };

  const clearCache = () => {
    setClearing(true);
    window.setTimeout(() => {
      setClearing(false);
      setCleared(true);
      notify({
        title: 'Кэш очищен',
        description: 'Локальные демонстрационные вложения удалены.',
        tone: 'success',
      });
    }, 900);
  };

  return (
    <div className="settings-section">
      <SettingsIntro
        title="Хранение данных"
        description="Медиа, кэш и правила загрузки вложений на этом устройстве."
      />

      <SettingsGroup title="Локальное хранилище">
        <div className="storage-usage">
          <div className="storage-usage__header">
            <span>
              <HardDrive size={16} /> Использовано {used} МБ из 1 ГБ
            </span>
            <span>{Math.round((used / 1024) * 100)}%</span>
          </div>
          <div className="storage-bar" aria-hidden="true">
            <span style={{ width: `${(used / 1024) * 100}%` }} />
          </div>
          <div className="storage-breakdown">
            <span>Изображения <strong>{breakdown.images} МБ</strong></span>
            <span>Файлы <strong>{breakdown.files} МБ</strong></span>
            <span>Кэш <strong>{breakdown.other} МБ</strong></span>
          </div>
        </div>
        <div className="settings-actions settings-actions--inline">
          <Button
            variant="outlined"
            size="sm"
            icon={<Trash2 size={15} />}
            loading={clearing}
            onClick={clearCache}
          >
            Очистить кэш
          </Button>
          <Button
            variant="text"
            size="sm"
            icon={<Download size={15} />}
            onClick={() =>
              notify({
                title: 'Архив данных',
                description: 'Экспорт локального кэша доступен после подключения реального хранилища.',
              })
            }
          >
            Скачать архив
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Медиа">
        <SettingsRow
          title="Автозагрузка медиа"
          description="Когда скачивать изображения и файлы из переписок."
        >
          <SettingsSelect
            label="Автозагрузка медиа"
            value={settings.autoDownloadMedia}
            onChange={(value) =>
              updateSettings({ autoDownloadMedia: value as typeof settings.autoDownloadMedia })
            }
            options={[
              { value: 'always', label: 'Всегда' },
              { value: 'wifi', label: 'Только Wi-Fi' },
              { value: 'never', label: 'Никогда' },
            ]}
          />
        </SettingsRow>
        <SettingsRow
          title="Хранить медиа"
          description="Как долго держать вложения в локальном кэше."
        >
          <SettingsSelect
            label="Срок хранения медиа"
            value={settings.mediaRetention}
            onChange={(value) =>
              updateSettings({ mediaRetention: value as typeof settings.mediaRetention })
            }
            options={[
              { value: 'forever', label: 'Бессрочно' },
              { value: 'month', label: '1 месяц' },
              { value: 'week', label: '1 неделя' },
            ]}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsNotice>
        Данные прототипа хранятся только в браузере. Очистка кэша не затрагивает реальные
        аккаунты Matrix или XMPP.
      </SettingsNotice>
    </div>
  );
}

const SHORTCUTS: Array<{ group: string; items: Array<[string, string]> }> = [
  {
    group: 'Навигация',
    items: [
      ['Глобальный поиск', '⌘ K / Ctrl K'],
      ['Перейти к сообщениям', '⌘ 1 / Ctrl 1'],
      ['Открыть контакты', '⌘ 2 / Ctrl 2'],
      ['Открыть аккаунты', '⌘ 3 / Ctrl 3'],
      ['Открыть настройки', '⌘ 4 / Ctrl 4'],
      ['Закрыть диалог или панель', 'Esc'],
    ],
  },
  {
    group: 'Сообщения',
    items: [
      ['Отправить сообщение', 'Enter'],
      ['Новая строка', 'Shift Enter'],
      ['Фокус на поле ввода', '⌘ J / Ctrl J'],
    ],
  },
  {
    group: 'Интерфейс',
    items: [
      ['Переключить тему', '⌘ ⇧ L'],
    ],
  },
];

export function ShortcutsSettings() {
  const { notify } = useUi();
  return (
    <div className="settings-section">
      <SettingsIntro
        title="Горячие клавиши"
        description="Клавиатурные сокращения для работы с Messthon без мыши."
        action={
          <Button
            variant="outlined"
            size="sm"
            icon={<RefreshCw size={15} />}
            onClick={() =>
              notify({
                title: 'Горячие клавиши',
                description: 'Сочетания сброшены к значениям по умолчанию.',
                tone: 'success',
              })
            }
          >
            Сбросить
          </Button>
        }
      />

      {SHORTCUTS.map((group) => (
        <SettingsGroup title={group.group} key={group.group}>
          <div className="shortcut-list">
            {group.items.map(([label, shortcut]) => (
              <div className="shortcut-row" key={label}>
                <span>{label}</span>
                <kbd>{shortcut}</kbd>
              </div>
            ))}
          </div>
        </SettingsGroup>
      ))}

      <SettingsNotice>
        Сочетания работают в браузере, если фокус находится внутри Messthon. Горячие клавиши
        прототипа отображаются для будущей настольной версии.
      </SettingsNotice>
    </div>
  );
}

export function AboutSettings() {
  const { notify } = useUi();
  const [checking, setChecking] = useState(false);

  const checkUpdates = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      notify({
        title: 'Обновления',
        description: 'Установлена последняя версия Messthon 0.1.0.',
        tone: 'success',
      });
    }, 950);
  };

  return (
    <div className="settings-section">
      <SettingsIntro
        title="О приложении"
        description="Messthon — единый интерфейс для Matrix, XMPP и будущих протоколов."
      />

      <div className="about-hero">
        <BrandMark size={54} />
        <div>
          <h3>Messthon</h3>
          <p>Мультипротокольный мессенджер · UI prototype</p>
          <span>Версия {APP_VERSION}</span>
        </div>
        <Button
          variant="outlined"
          size="sm"
          icon={<RefreshCw size={15} />}
          loading={checking}
          onClick={checkUpdates}
        >
          Проверить обновления
        </Button>
      </div>

      <SettingsGroup title="Сборка">
        <div className="about-facts">
          <div>
            <span>Frontend</span>
            <strong>React 18 · TypeScript · Vite</strong>
          </div>
          <div>
            <span>Дизайн-система</span>
            <strong>Material Design 3 · Inter</strong>
          </div>
          <div>
            <span>Протоколы</span>
            <strong>Matrix · XMPP</strong>
          </div>
          <div>
            <span>Режим</span>
            <strong>Frontend prototype · demo data</strong>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Ресурсы">
        <button type="button" className="about-link" onClick={() => notify({ title: 'Документация', description: 'README.md находится в корне проекта.' })}>
          <CircleHelp size={17} />
          <span>
            <strong>Документация</strong>
            <span>Запуск, структура и архитектура проекта</span>
          </span>
          <ChevronRight size={15} />
        </button>
        <button type="button" className="about-link" onClick={() => notify({ title: 'Сообщить о проблеме', description: 'Обратная связь будет подключена к трекеру проекта.' })}>
          <Info size={17} />
          <span>
            <strong>Сообщить о проблеме</strong>
            <span>Открыть форму обратной связи</span>
          </span>
          <ChevronRight size={15} />
        </button>
        <button type="button" className="about-link" onClick={() => notify({ title: 'Лицензии', description: 'Messthon UI prototype · открытые библиотеки React, Vite и Lucide.' })}>
          <FileArchive size={17} />
          <span>
            <strong>Лицензии и библиотеки</strong>
            <span>Сторонние зависимости и лицензии</span>
          </span>
          <ChevronRight size={15} />
        </button>
      </SettingsGroup>

      <div className="about-footer">
        <ShieldCheck size={15} />
        <span>
          Прототип не выполняет сетевых подключений и не хранит реальные сообщения. Все данные
          демонстрационные.
        </span>
      </div>
      <span className="about-build">build 2026.11 · demo</span>
    </div>
  );
}
