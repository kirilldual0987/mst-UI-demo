import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Info } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { PageHeader } from '../layout/PageHeader';
import { SettingsIndex } from './SettingsIndex';
import { getSettingsSection, SETTINGS_GROUPS } from './settingsConfig';
import { AppearanceSettings, InterfaceSettings, MessagesSettings } from './sections/GeneralSettings';
import {
  AccountsSettings,
  NotificationsSettings,
  ProtocolsSettings,
} from './sections/ConnectionSettings';
import {
  EncryptionSettings,
  PrivacySettings,
  SecuritySettings,
} from './sections/PrivacySettings';
import { AboutSettings, ShortcutsSettings, StorageSettings } from './sections/AppSettings';
import { MatrixSettings, XmppSettings } from './sections/ProtocolSettings';

const SECTION_COMPONENTS: Record<string, () => JSX.Element> = {
  appearance: AppearanceSettings,
  interface: InterfaceSettings,
  messages: MessagesSettings,
  accounts: AccountsSettings,
  protocols: ProtocolsSettings,
  matrix: MatrixSettings,
  xmpp: XmppSettings,
  notifications: NotificationsSettings,
  privacy: PrivacySettings,
  security: SecuritySettings,
  encryption: EncryptionSettings,
  storage: StorageSettings,
  shortcuts: ShortcutsSettings,
  about: AboutSettings,
};

export function SettingsPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSection = getSettingsSection(section);
  const Content = section ? SECTION_COMPONENTS[section] : undefined;

  useEffect(() => {
    if (isDesktop && !section) {
      navigate('/settings/appearance', { replace: true });
    }
  }, [isDesktop, navigate, section]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [section]);

  return (
    <div className="page settings-page">
      <PageHeader
        title="Настройки"
        backTo={!isDesktop && section ? '/settings' : undefined}
        subtitle={
          isDesktop ? (
            <span className="settings-page__subtitle">
              Единые настройки Messthon и отдельные параметры протоколов
            </span>
          ) : section ? (
            <span className="settings-page__subtitle">
              {activeSection?.label ?? 'Настройки'}
            </span>
          ) : undefined
        }
      />

      <div className="settings-layout">
        {isDesktop && (
          <nav className="settings-nav" aria-label="Разделы настроек">
            {SETTINGS_GROUPS.map((group) => (
              <div className="settings-nav__group" key={group.label}>
                <span className="settings-nav__label">{group.label}</span>
                {group.sections.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`settings-nav__item ${section === item.id ? 'is-active' : ''}`}
                    aria-current={section === item.id ? 'page' : undefined}
                    onClick={() => navigate(`/settings/${item.id}`)}
                  >
                    <span className="settings-nav__icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="settings-nav__chevron" />
                  </button>
                ))}
              </div>
            ))}
            <div className="settings-nav__footer">
              <span>Messthon 0.1.0</span>
              <span>UI prototype</span>
            </div>
          </nav>
        )}

        <div className="settings-content" ref={contentRef}>
          {isDesktop ? (
            <div className="settings-content__inner">
              {Content && activeSection ? (
                <Content />
              ) : (
                <div className="settings-missing">
                  <Info size={24} />
                  <h2>Раздел не найден</h2>
                  <p>Выберите раздел настроек в списке слева.</p>
                </div>
              )}
            </div>
          ) : section ? (
            <div className="settings-content__inner">
              {Content && activeSection ? (
                <Content />
              ) : (
                <div className="settings-missing">
                  <Info size={24} />
                  <h2>Раздел не найден</h2>
                  <p>Этот раздел настроек не существует.</p>
                </div>
              )}
            </div>
          ) : (
            <SettingsIndex groups={SETTINGS_GROUPS} />
          )}
        </div>
      </div>
    </div>
  );
}
