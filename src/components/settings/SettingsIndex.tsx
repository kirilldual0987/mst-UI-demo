import { ChevronRight, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SettingsGroupMeta } from './settingsConfig';

interface SettingsIndexProps {
  groups: SettingsGroupMeta[];
}

export function SettingsIndex({ groups }: SettingsIndexProps) {
  const navigate = useNavigate();

  return (
    <div className="settings-index">
      <div className="settings-index__intro">
        <span className="settings-index__icon">
          <Settings2 size={22} />
        </span>
        <div>
          <h2>Настройки Messthon</h2>
          <p>Выберите раздел, чтобы изменить только нужные параметры.</p>
        </div>
      </div>

      {groups.map((group) => (
        <section className="settings-index__group" key={group.label}>
          <h3>{group.label}</h3>
          <div className="settings-index__list">
            {group.sections.map((section) => (
              <button
                type="button"
                className="settings-index__row"
                key={section.id}
                onClick={() => navigate(`/settings/${section.id}`)}
              >
                <span className="settings-index__row-icon">{section.icon}</span>
                <span className="settings-index__row-copy">
                  <strong>{section.label}</strong>
                  <span>{section.description}</span>
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="settings-index__footer">
        <span>Messthon</span>
        <span>0.1.0 · UI prototype</span>
      </div>
    </div>
  );
}
