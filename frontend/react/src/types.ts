export interface User {
  _id: string;
  id: string;
  username?: string;
  avatar?: string;
  token?: string;
  findById?: boolean;
  isTemporary?: boolean;
  status?: 'online' | 'offline';
  matrixUserId?: string;
  matrixAccessToken?: string;
}

export interface Chat {
  id: string;
  title: string;
  avatar?: string;
  members: number;
  role?: string;
  matrixChatId?: string;
  //lastMessage?: string;
  //lastMessageTime?: string;
  type: 'GROUP' | 'DM';
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

export interface Profile {
  id: string;
  username: string;
  findById: boolean;
  //avatar?: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
  chatId: string;
  user?: User;
  friend?: User;
  status: 'pending' | 'accepted' | 'declined';
}

export interface InviteData {
  userId: string;
  username: string;
  avatar: string;
}

export interface ChatInviteData {
  id: string;
  title: string;
  avatar?: string;
}

export interface FriendData {
  id: string;
  username: string;
  avatar?: string;
  chatId: string;
}