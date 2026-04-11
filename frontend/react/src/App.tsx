import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './component/Sidebar';
import ChatWindow from './component/ChatWindow';
import Settings from './component/Settings';
import { apiService } from './service/api';
import { User, Chat, Message, FriendData } from './types';
import './App.css';
import ChatSettings from './component/ChatSettings';
import { matrixService, useMatrix } from './service/MatrixService';

type SyncState = 'ERROR' | 'PREPARED' | 'SYNCING' | 'CATCHUP' | 'RECONNECTING' | 'STOPPED';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMatrixReady, setIsMatrixReady] = useState(false);
  const [syncState, setSyncState] = useState<SyncState | null>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'invitations'>('groups');
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showSignupPage, setShowSignupPage] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const unsubscribe = matrixService.subscribeToNewRooms(async (roomId: string) => {
      console.log('📬 New room detected:', roomId);
      
      const existingChat = chats.find(c => c.matrixChatId === roomId);
      if (existingChat) {
        console.log('ℹ️ Chat already exists:', roomId);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("roomId: " + roomId)
      const newChat = await apiService.getChatByMatrixId(roomId);
      if (newChat) {
        console.log('✅ Adding new chat to list:', newChat);
        const chatsData = await apiService.getChats();
        setChats(chatsData);
        if(newChat.type === "DM") {
          const friendData = await apiService.getFriends();
          setFriends(friendData);
        }
      }
    });

    return () => unsubscribe();
  }, [chats, friends])

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

      const unsubscribe = matrixService.subscribeToSyncState((state) => {
        setSyncState(state);
        if (state === 'SYNCING' || state === 'PREPARED') {
          setIsMatrixReady(true);
        }
      });

      try {
        await matrixService.waitForSync(30000);
        setIsMatrixReady(true);
        setIsAuthenticated(true);
      } catch (e) {
        setIsMatrixReady(true);
        setIsAuthenticated(true);
      }

      unsubscribe();
      const [chatsData, friendshipData] = await Promise.all([
        apiService.getChats(),
        apiService.getFriends()
      ]);
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
        const roomId = await matrixService.createRoom(name, 'GROUP');
        const newChat = await apiService.createChat(name, roomId);
        await matrixService.getClient()?.joinRoom(roomId);
        console.log("roomId: " + roomId + " " + matrixService.getClient()?.getRoom(roomId))
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
    logout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
      try {
        if(!profile)
          return;
        
        await apiService.deleteProfile();
        logout();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const logout = () => {
    matrixService.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('matrixUserId');
    localStorage.removeItem('matrixAccessToken');
    location.reload();
  }

  const handleUpdateChat = async (chat: Partial<Chat>) => {
    setShowChatSettings(false);
    await apiService.updateChat({ id: chat.id, title: chat.title })
    setChats(chats.map((mapped) => {
      if(mapped.id === activeChat) {
        mapped.title = chat.title!!
      }
      return mapped;
    }))
  }

  const handleDeleteChat = async () => {
    if(!activeChat)
      return;

    if (window.confirm("Вы уверены? Это действие нельзя отменить.")) {
      await apiService.deleteChat(activeChat);
      removeChatFromList();
    }
  }

  const handleLeaveChat = async () => {
    if(!activeChat)
      return;

    await apiService.leaveChat(activeChat);
    removeChatFromList();
  }

  const handleRemoveFriend = async () => {
    if(!activeChat)
      return;

    const response = await apiService.removeFriend(activeChat);
    
    setFriends(friends.filter((friend) => friend.id != response.id))
    removeChatFromList();
  }

  const removeChatFromList = () => {
    setChats(chats.filter((chat) => chat.id != activeChat));
    setActiveChat(null);
    setShowChatSettings(false);
  }

  const getChatTitle = () => {
      const chat = chats.find((chat) => chat.id == activeChat)
      if(chat?.type === "DM")
        return friends.find((friend) => friend.chatId === chat.id)!!.username;

      return chat?.title!!;
  }

  if (!profile || !isMatrixReady) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  return (
    <div className="app">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        profile={profile}
        friends={friends}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={(chat) => {
          setActiveChat(chat);
          setShowLoginPage(false);
          setShowSignupPage(false);
          setSidebarOpen(false);
        }}
        onSettingsClick={() => setShowSettings(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <ChatWindow
        chat={chats.find((chat) => chat.id == activeChat)!!}
        //messages={messages}
        onSendMessage={handleSendMessage}
        onClickSettings={() => setShowChatSettings(true)}
        //isLoading={isLoading}
        isLoginPage={showLoginPage}
        isSignupPage={showSignupPage}
        onLogin={() => {
          loadInitialData();
          setShowLoginPage(false);
          setSidebarOpen(true);
        }}
        onSignup={() => {
          loadInitialData();
          setShowSignupPage(false);
          setSidebarOpen(true);
        }}
        onClose={() => {
          setActiveChat(null);
          setSidebarOpen(true);
        }}
      />

      {showChatSettings && (
        <ChatSettings
          chat={chats.find((chat) => chat.id == activeChat)!!}
          onClose={() => setShowChatSettings(false)}
          onSave={handleUpdateChat}
          onDelete={() => {
            handleDeleteChat();
            setSidebarOpen(true);
          }}
          onLeave={() => {
            handleLeaveChat();
            setSidebarOpen(true);
          }}
          onRemoveFriend={() => {
            handleRemoveFriend();
            setSidebarOpen(true);
          }}
        />
      )}

      {showSettings && (
        <Settings
          profile={profile}
          onLogin={() => {
            setShowSettings(false);
            setShowLoginPage(true);
            setShowSignupPage(false);
            setActiveChat(null);
            setSidebarOpen(false);
          }}
          onSignup={() => {
            setShowSettings(false);
            setShowSignupPage(true);
            setShowLoginPage(false);
            setActiveChat(null);
            setSidebarOpen(false);
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