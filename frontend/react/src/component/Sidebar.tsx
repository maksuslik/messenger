import React, { useEffect, useState } from 'react';
import { Chat, FriendData } from '../types';
import { matrixService } from '../service/MatrixService';
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
  isOpen?: boolean;
  onClose: () => void;
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
  isOpen = true,
  onClose
}) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        {searchOpen ? <div className="search">
          <input
              className="search-form"
              type="text"
              placeholder="@юзер, #группа"
              onChange={(e) => console.log(e)}
            />
          <div className="back-button" onClick={() => setSearchOpen(false)}>❌</div>
        </div> :
        <div className="user-profile" onClick={onSettingsClick}>
          <img src={profile.avatar || '/default-avatar.png'} alt={profile.username} className="avatar" />
          <div className="user-info">
            <div className="username">{profile.username}</div>
            <div className="userid">@{profile.id}</div>
          </div>
        </div>
      }

      {!searchOpen && <div className="search-icon" onClick={() => setSearchOpen(true)}>🔍</div>}
      </div>

      {!searchOpen && <div className="tabs">
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
      </div>}

      {activeTab === 'groups' && !searchOpen && (<div className="chat-list">
        {chats.filter((chat) => chat.type === 'GROUP').map((chat) => (
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

      {activeTab === 'friends' && !searchOpen && (
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