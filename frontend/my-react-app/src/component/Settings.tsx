// components/Settings.tsx
import React, { useState } from 'react';
import { Profile } from '../types';
import './Settings.css';

interface SettingsProps {
  profile: Profile;
  onSave: (profile: Partial<Profile>) => void;
  onCreateGroup: () => void;
  onCreateInviteUrl: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  profile,
  onSave,
  onCreateGroup,
  onCreateInviteUrl,
  onLogout,
  onDeleteAccount,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    username: profile.username,
    searchById: true,
  });

  const handleSave = () => {
    onSave({ username: formData.username });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <button className="back-button" onClick={onClose}>←</button>
          <h2>Настройки</h2>
        </div>

        <div className="settings-content">
          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <button className="check-button">✓</button>
          </div>

          <div className="form-group">
            <label>@id:</label>
            <input type="text" value={profile.id} disabled />
            <button className="check-button">✓</button>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="searchById"
              checked={formData.searchById}
              onChange={(e) => setFormData({ ...formData, searchById: e.target.checked })}
            />
            <label htmlFor="searchById">Разрешить искать меня по id.</label>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={onCreateGroup}>
              Создать группу
            </button>
            <button className="btn btn-primary" onClick={onCreateInviteUrl}>
              Создать URL для приглашения в друзья
            </button>
          </div>

          <div className="settings-danger">
            <button className="btn btn-warning" onClick={onLogout}>
              Выйти из аккаунта
            </button>
            <button className="btn btn-danger" onClick={onDeleteAccount}>
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;