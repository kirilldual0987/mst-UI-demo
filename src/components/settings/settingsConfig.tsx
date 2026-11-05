import type { ReactNode } from 'react';
import {
  Bell,
  Database,
  Grid2X2,
  Info,
  Keyboard,
  KeyRound,
  Layers3,
  LayoutPanelTop,
  LockKeyhole,
  MessageSquareText,
  Network,
  Palette,
  Shield,
  Zap,
} from 'lucide-react';

export interface SettingsSectionMeta {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
}

export interface SettingsGroupMeta {
  label: string;
  sections: SettingsSectionMeta[];
}

const iconSize = 17;

export const SETTINGS_GROUPS: SettingsGroupMeta[] = [
  {
    label: 'Оформление',
    sections: [
      {
        id: 'appearance',
        label: 'Внешний вид',
        description: 'Тема, акцент и типографика',
        icon: <Palette size={iconSize} />,
      },
      {
        id: 'interface',
        label: 'Интерфейс',
        description: 'Панели и поведение рабочей области',
        icon: <LayoutPanelTop size={iconSize} />,
      },
      {
        id: 'messages',
        label: 'Сообщения',
        description: 'Ввод, статусы и квитанции',
        icon: <MessageSquareText size={iconSize} />,
      },
    ],
  },
  {
    label: 'Подключения',
    sections: [
      {
        id: 'accounts',
        label: 'Аккаунты',
        description: 'Идентичности и синхронизация',
        icon: <Layers3 size={iconSize} />,
      },
      {
        id: 'protocols',
        label: 'Протоколы',
        description: 'Matrix, XMPP и будущие адаптеры',
        icon: <Network size={iconSize} />,
      },
      {
        id: 'matrix',
        label: 'Matrix',
        description: 'Homeserver, комнаты и ключи',
        icon: <Grid2X2 size={iconSize} />,
      },
      {
        id: 'xmpp',
        label: 'XMPP',
        description: 'JID, ресурсы и OMEMO',
        icon: <Zap size={iconSize} />,
      },
      {
        id: 'notifications',
        label: 'Уведомления',
        description: 'Звук, превью и тихие часы',
        icon: <Bell size={iconSize} />,
      },
    ],
  },
  {
    label: 'Приватность',
    sections: [
      {
        id: 'privacy',
        label: 'Приватность',
        description: 'Присутствие и видимость',
        icon: <Shield size={iconSize} />,
      },
      {
        id: 'security',
        label: 'Безопасность',
        description: 'Блокировка и сессии',
        icon: <LockKeyhole size={iconSize} />,
      },
      {
        id: 'encryption',
        label: 'Шифрование',
        description: 'Megolm, OMEMO и ключи',
        icon: <KeyRound size={iconSize} />,
      },
    ],
  },
  {
    label: 'Приложение',
    sections: [
      {
        id: 'storage',
        label: 'Хранение данных',
        description: 'Кэш и автозагрузка медиа',
        icon: <Database size={iconSize} />,
      },
      {
        id: 'shortcuts',
        label: 'Горячие клавиши',
        description: 'Управление с клавиатуры',
        icon: <Keyboard size={iconSize} />,
      },
      {
        id: 'about',
        label: 'О приложении',
        description: 'Версия и технические сведения',
        icon: <Info size={iconSize} />,
      },
    ],
  },
];


export function getSettingsSection(
  sectionId?: string,
): SettingsSectionMeta | undefined {
  return SETTINGS_GROUPS.flatMap((group) => group.sections).find(
    (section) => section.id === sectionId,
  );
}
