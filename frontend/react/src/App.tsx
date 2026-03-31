import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './component/Sidebar';
import ChatWindow from './component/ChatWindow';
import Settings from './component/Settings';
import { apiService } from './service/api';
import { User, Chat, Message, Profile, FriendData } from './types';
import './App.css';

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'invitations'>('groups');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
    }
  }, [activeChat]);

  const loadInitialData = async () => {
    try {
      const [profileData, chatsData, friendshipData] = await Promise.all([
        apiService.getProfile(),
        apiService.getChats(),
        apiService.getFriends()
      ]);
      setProfile(profileData);
      setChats(chatsData);
      setFriends(friendshipData)
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const messagesData = await apiService.getMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;
    
    try {
      const newMessage = await apiService.sendMessage(activeChat, content);
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateProfile = async (profileData: Partial<Profile>) => {
    try {
      const updated = await apiService.updateProfile(profileData);
      setProfile(updated);
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCreateGroup = async () => {
    const name = prompt('Введите название группы:');
    if (name) {
      try {
        const newChat = await apiService.createChat(name);
        setChats((prev) => [...prev, newChat]);
        setShowSettings(false);
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  const handleCreateInviteUrl = async () => {
    try {
      const url = await apiService.createInviteUrl();
      navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (error) {
      console.error('Error creating invite URL:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
      try {
        if(!profile)
          return;

        await apiService.deleteProfile(profile);
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (!profile) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  return (
    <div className="app">
      <Sidebar
        profile={profile}
        friends={friends}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onSettingsClick={() => setShowSettings(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <ChatWindow
        chatId={activeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {showSettings && (
        <Settings
          profile={profile}
          onSave={handleUpdateProfile}
          onCreateGroup={handleCreateGroup}
          onCreateInviteUrl={handleCreateInviteUrl}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;

/*import { useAuth } from './AuthContext';
import api from './AuthContext';
//import api from './AuthContext';
import { useEffect, useState } from 'react';

function App() {
  const { user, isLoading } = useAuth();
  const [message, setMessage] = useState('');

  if (isLoading) return <div>Загрузка профиля...</div>;

  const testData = async () => {
    setMessage("Загрузка...")
    const authToken = localStorage.getItem('authToken')
    try {
      // Пример защищенного запроса
      const res = await api.get('/auth/me', {
        headers: {
          "X-Auth-Token": authToken
        }
      });
      console.log(res.data)
      setMessage(`Response: ${res.status} OK. Login: ${res.data.login}; id: ${authToken}; authToken: ${res.data.id}`);
    } catch (e) {
      setMessage('Ошибка доступа');
    }
  };

  return (
    <div>
      <h1>Логин: {user?.login}</h1>
      <button onClick={testData}>Fetch data</button>
      <p>{message}</p>
    </div>
  );
}

export default App;*/