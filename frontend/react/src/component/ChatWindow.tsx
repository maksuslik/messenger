import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import '../style/ChatWindow.css';
import { apiService } from '../service/api'

interface ChatWindowProps {
  chatId: string | null;
  chat: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClickSettings: () => void;
  isLoading: boolean;
  isLoginPage: boolean;
  isSignupPage: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  chat,
  messages,
  onSendMessage,
  onClickSettings,
  isLoading,
  isLoginPage,
  isSignupPage,
  onLogin,
  onSignup,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !chatId) return;
        
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim() || !chatId) return;
        
    onSendMessage(inputValue.trim());
    setInputValue('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    try {
      const response = await apiService.login(login, password);
      localStorage.setItem('authToken', response);
      setLogin('');
      setPassword('');
      setAuthError('');
      isLoginPage = false;
      onLogin();
    } catch (error: any) {
      console.log(error.response)
      setAuthError(error.response?.data?.message || 'Ошибка входа');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setAuthError('Пароль должен быть длиннее 6 символов');
      return;
    }

    setIsAuthLoading(true);

    try {
      const response = await apiService.signUp(login, password);
      console.log(response)
      localStorage.setItem('authToken', response.token!!);
      setLogin('');
      setPassword('');
      setConfirmPassword('');
      setAuthError('')
      isSignupPage = false;
      onSignup();
    } catch (error: any) {
      console.log(error.response)
      setAuthError(error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (isLoginPage || isSignupPage) {
    return (
      <div className="chat-window">
        <button className="back-button" onClick={onClose}>←</button>
        <div className="auth-container">
          <div className="auth-form">
            <h2 className="auth-title">
              {isLoginPage ? 'Войти' : 'Регистрация'}
            </h2>

            {authError && (
              <div className="auth-error">{authError}</div>
            )}

            <form onSubmit={isLoginPage ? handleLogin : handleRegister}>
              <div className="form-group">
                <label htmlFor="login" className="form-label">
                  Логин
                </label>
                <input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="form-input"
                  placeholder="Введите логин"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Введите пароль"
                  required
                  autoComplete={isLoginPage ? 'current-password' : 'new-password'}
                />
              </div>

              {isSignupPage && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Повторите пароль"
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={isAuthLoading}
              >
                {isAuthLoading
                  ? 'Загрузка...'
                  : isLoginPage
                  ? 'Войти'
                  : 'Зарегистрироваться'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">Выберите чат для начала общения</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="infobar">
        <button className="back-button" onClick={onClose}>←</button>
          <h3>{chat}</h3>
          <button className="settings-button" onClick={onClickSettings}>
            <img src="src/assets/icon_settings.svg" alt="Настройки" className="settings-image" />
          </button>
      </div>
      <div className="messages-container">
        {isLoading ? (
          <div className="loading">Загрузка сообщений...</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message">
              <img src={message.avatar || '/default-avatar.png'} alt={message.username} className="message-avatar" />
              <div className="message-content">
                <div className="message-header">
                  <span className="message-username">{message.username}</span>
                  <span className="message-time">{new Date(message.timestamp).toLocaleString('ru-RU')}</span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={sendMessage}>
        <button type="button" className="attach-button">📎</button>
        <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Сообщение..."
                rows={1}
                className="chat-input"
            />
        <button type="submit" className="send-button">➤</button>
      </form>
    </div>
  );
};

export default ChatWindow;