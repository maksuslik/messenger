import React from 'react';
import { Chat, FriendData } from '../types';
import '../style/Sidebar.css';

interface SidebarProps {
  profile: any;
  friends: FriendData[];
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onSettingsClick: () => void;
  activeTab: 'friends' | 'groups' | 'invitations';
  onTabChange: (tab: 'friends' | 'groups' | 'invitations') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  profile,
  friends,
  chats,
  activeChat,
  onChatSelect,
  onSettingsClick,
  activeTab,
  onTabChange,
}) => {
  console.log("friends: " + friends.map((friend) => (friend.username)))
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile" onClick={onSettingsClick}>
          <img src={profile.avatar || '/default-avatar.png'} alt={profile.login} className="avatar" />
          <div className="user-info">
            <div className="username">{profile.login}</div>
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

      {activeTab === 'groups' && (<div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <img src={chat.avatar || '/default-chat.png'} alt={chat.title} className="chat-avatar" />
            <div className="chat-info">
              <div className="chat-name">{chat.title}</div>
              <div className="chat-meta">Участников: {chat.members}</div>
            </div>
          </div>
        ))}
      </div>)}

      {activeTab === 'friends' && (
        <div className="chat-list">
          {friends.map((friend) => (
            <div
            key={`friend-`+friend.id}
            className={`chat-item ${activeChat === friend.chatId ? 'active' : ''}`}
            onClick={() => onChatSelect(friend.chatId)}
          >
            <img src={friend.avatar || '/default-chat.png'} alt={friend.username} className="chat-avatar" />
            <div className="chat-info">
              <div className="chat-name">{friend.username}</div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;