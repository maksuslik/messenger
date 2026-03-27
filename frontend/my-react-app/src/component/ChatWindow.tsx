// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import './ChatWindow.css';

interface ChatWindowProps {
  chatId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && chatId) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  if (!chatId) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">Выберите чат для начала общения</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
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

      <form className="message-input-form" onSubmit={handleSubmit}>
        <button type="button" className="attach-button">📎</button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Напишите сообщение..."
          className="message-input"
        />
        <button type="submit" className="send-button">➤</button>
      </form>
    </div>
  );
};

export default ChatWindow;