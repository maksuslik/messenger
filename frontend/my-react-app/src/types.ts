export interface User {
  id: string;
  username: string;
  //avatar?: string;
  status?: 'online' | 'offline';
}

export interface Chat {
  id: string;
  title: string;
  avatar?: string;
  members: number;
  //lastMessage?: string;
  //lastMessageTime?: string;
  type: 'group' | 'dm';
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
  //avatar?: string;
  //email?: string;
}