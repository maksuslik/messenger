// pages/InvitePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../service/api';
import { InviteData } from '../types'
import '../style/InvitePage.css';
import { matrixService } from '../service/MatrixService';

const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Неверная ссылка');
      setLoading(false);
      return;
    }
    
    loadInvite();
  }, [token])

  const loadInvite = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if(!authToken) {
        setError("Вы не авторизованы!")
        return;
      }

      await apiService.getProfile();

      const data = await apiService.getInviteData(token!!);
      setInvite(data);
    } catch (err: any) {
      console.log(err)
      setError(err.response?.data?.message || 'Приглашение не найдено или истекло');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token || processing) return;
    
    setProcessing(true);
    try {
      const friendMatrixId = await apiService.getMatrixId(token);
      const matrixChatId = await matrixService.createRoom("DM", "DM", [friendMatrixId]);
      await matrixService.getClient()?.joinRoom(matrixChatId);

      const invite = await apiService.acceptInvite(token, matrixChatId);
      navigate('/', { state: { showNotification: 'Друзья добавлены!' } });
    } catch (err: any) {
      console.log(err)
      setError(err.response?.data?.message || 'Ошибка при принятии приглашения');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token || processing) return;
    
    setProcessing(true);
    try {
      navigate('/', { state: { showNotification: 'Приглашение отклонено' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="invite-overlay">
        <div className="invite-modal loading">
          <div className="spinner" />
          <p>Загрузка приглашения...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="invite-overlay" onClick={handleClose}>
        <div className="invite-modal error" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={handleClose}>×</button>
          <div className="error-icon">⚠️</div>
          <h3>Приглашение недоступно</h3>
          <p>{error || 'Ссылка недействительна или срок её действия истёк'}</p>
          <button className="btn btn-primary" onClick={handleClose}>
            Вернуться в чат
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-overlay" onClick={handleClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>×</button>
        
        <div className="invite-header">
          <h2>Приглашение в друзья</h2>
        </div>
        
        <div className="invite-content">
          <div className="inviter-profile">
            <img 
              src={invite.avatar || '/default-avatar.png'} 
              alt={invite.username}
              className="inviter-avatar"
            />
            <div className="inviter-info">
              <span className="inviter-label">Вас пригласил:</span>
              <span className="inviter-username">{invite.username}</span>
            </div>
          </div>
          
          <p className="invite-description">
            Хотите добавить <strong>{invite.username}</strong> в друзья?
          </p>
        </div>
        
        <div className="invite-actions">
          <button 
            className="btn btn-decline" 
            onClick={handleDecline}
            disabled={processing}
          >
            Отклонить
          </button>
          <button 
            className="btn btn-accept" 
            onClick={handleAccept}
            disabled={processing}
          >
            {processing ? 'Обработка...' : 'Принять'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;