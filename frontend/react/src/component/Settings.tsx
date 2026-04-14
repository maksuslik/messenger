import React, { useState } from 'react';
import { Profile, User } from '../types';
import '../style/Settings.css';
import { Invite } from './Invite'
import { apiService } from '../service/api'

interface SettingsProps {
  profile: User;
  onSave: (profile: User) => void;
  onLogin: () => void;
  onSignup: () => void;
  onCreateGroup: () => void;
  onCreateInviteUrl: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  profile,
  onSave,
  onLogin,
  onSignup,
  onCreateGroup,
  onCreateInviteUrl,
  onLogout,
  onDeleteAccount,
  onClose,
}) => {
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username,
    id: profile.id,
    findById: profile.findById ?? true,
    isTemporary: profile.isTemporary ?? true
  });

  const [authError, setAuthError] = useState('');

  const handleSave = async () => {
    console.log(formData.id + " " + profile.id)
    try {
      const updated = await apiService.updateProfile(formData);
      console.log(updated)
      onSave(updated);
    } catch (error: any) {
      console.log("error " + error)
      setAuthError(error.response?.data?.message || 'Ошибка входа');
    }
  };

  const createUrl = () => {
    const url = "https://msldev.ru/invite/" + profile._id
    return url;
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <button className="back-button" onClick={onClose}>←</button>
          <h2>Настройки</h2>
        </div>

        <div className="settings-content">
          {formData.isTemporary && <div className="notification-group temp-banner-text">
            <span>Вы используете временный аккаунт. Он будет доступен до очистки данных браузера. Для сохранения данных</span>
            <button className='temp-banner-link' onClick={onLogin}>войдите </button>
            <span>или </span>
            <button className='temp-banner-link' onClick={onSignup}>зарегистрируйтесь. </button>
            <span>Но это не обязательно 😎</span>
          </div>
          }

          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>@id:</label>
            <input 
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>

          {authError && <div className="auth-error">{authError}</div>}
        
          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSave}>Сохранить изменения</button>
            <button className="btn btn-primary" onClick={onCreateGroup}>
              Создать группу
            </button>
            <button className="btn btn-primary" onClick={() => setShowInvitePopup(true)}>
              Создать URL для приглашения в друзья
            </button>

            <Invite
              isOpen={showInvitePopup}
              onClose={() => setShowInvitePopup(false)}
              inviteLink={createUrl()}
              title="Приглашение в друзья"
            />
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