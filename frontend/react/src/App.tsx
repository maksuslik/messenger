import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './component/Sidebar';
import ChatWindow from './component/ChatWindow';
import Settings from './component/Settings';
import { apiService } from './service/api';
import { User, Chat, Message, Profile, FriendData } from './types';
import './App.css';

const App: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'invitations'>('groups');
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showSignupPage, setShowSignupPage] = useState(false);
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
      await new Promise(resolve => setTimeout(resolve, 100));
    
      const profileData = await apiService.getProfile();
      
      if (!profileData || !profileData.username) {
        throw new Error('Invalid profile data');
      }

      setProfile(profileData);

      const [chatsData, friendshipData] = await Promise.all([
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

  const handleUpdateProfile = async (profileData: User) => {
    try {
      setProfile(profileData);
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
    localStorage.removeItem('authToken');
    location.reload();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
      try {
        if(!profile)
          return;
        
        const token = localStorage.getItem('authToken')!!;
        await apiService.deleteProfile(token);
        localStorage.removeItem('authToken');
        location.reload();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (!profile) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  console.log(profile)

  return (
    <div className="app">
      <Sidebar
        profile={profile}
        friends={friends}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={(chat) => {
          setActiveChat(chat);
          setShowLoginPage(false);
          setShowSignupPage(false);
        }}
        onSettingsClick={() => setShowSettings(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <ChatWindow
        chatId={activeChat}
        chat={chats.find((chat) => chat.id == activeChat)?.title!!}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isLoginPage={showLoginPage}
        isSignupPage={showSignupPage}
        onLogin={() => {
          loadInitialData();
          setShowLoginPage(false);
        }}
        onSignup={() => {
          loadInitialData();
          setShowSignupPage(false);
        }}
        onClose={() => setActiveChat(null)}
      />

      {showSettings && (
        <Settings
          profile={profile}
          onLogin={() => {
            setShowSettings(false);
            setShowLoginPage(true);
            setShowSignupPage(false);
            setActiveChat(null);
          }}
          onSignup={() => {
            setShowSettings(false);
            setShowSignupPage(true);
            setShowLoginPage(false);
            setActiveChat(null);
          }}
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