import React from 'react';
import { Chat } from '../types';
import './Sidebar.css';

interface SidebarProps {
  profile: any;
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onSettingsClick: () => void;
  activeTab: 'friends' | 'groups' | 'invitations';
  onTabChange: (tab: 'friends' | 'groups' | 'invitations') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  profile,
  chats,
  activeChat,
  onChatSelect,
  onSettingsClick,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile" onClick={onSettingsClick}>
          <img src={profile.avatar || '/default-avatar.png'} alt={profile.username} className="avatar" />
          <div className="user-info">
            <div className="username">{profile.username}</div>
            <div className="userid">({profile.id})</div>
          </div>
        </div>
        <div className="search-icon">🔍</div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => onTabChange('friends')}
        >
          Друзья
        </button>
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => onTabChange('groups')}
        >
          Группы
        </button>
        <button 
          className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => onTabChange('invitations')}
        >
          Приглашения
        </button>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <img src={chat.avatar || '/default-chat.png'} alt={chat.name} className="chat-avatar" />
            <div className="chat-info">
              <div className="chat-name">{chat.name}</div>
              <div className="chat-meta">Участников ({chat.participants})</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;