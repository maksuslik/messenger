import { Profile, Chat, User, Message, Friendship, InviteData, FriendData } from '../types.ts'
import api from '../AuthContext'

class ApiService {
  constructor() {
    api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers['Authorization'] = token; 
  }
  return config;
});
  }

  // Профиль
  async getProfile(): Promise<User> {
    let token = localStorage.getItem('authToken');

    if (!token) {
      try {
        const response = await api.post('/auth/init');
        token = response.data.token;

        if(token) {
          localStorage.setItem('authToken', token);
        }

        return { id: response.data.id, username: response.data.username }
      } catch (error) {
        console.error("Failed to register", error);
      }
    }

    const { data } = await api.get('/auth/me');
    return data;
  }

  async login(username: string, password: string): Promise<string> {
    const { data } = await api.post('/auth/login', {
      "username": username,
      "password": password
    })
    return data.token
  }

  async signUp(username: string, password: string): Promise<User> {
      const { data } = await api.post('/auth/signup', {
      "username": username,
      "password": password
    })
      return data;
  }

  async updateProfile(profile: Partial<User>): Promise<User> {
    const { data } = await api.patch('/profile', profile);
    return data;
  }

  async deleteProfile(token: string): Promise<Profile> {
    const { data } = await api.delete('/profile', {
        data: token
    });
    return data;
  }

  // Чаты
  async getChats(): Promise<Chat[]> {
    const { data } = await api.get('/chats/get');
    return data;
  }

  async createChat(name: string): Promise<Chat> {
    const { data } = await api.post(
        '/chats/create',
        { "name": name }
    );
    return data;
  }

  // Сообщения
  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return data;
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const { data } = await api.post(`/chats/${chatId}/messages`, { content });
    return data;
  }

  // Друзья
  async getFriends(): Promise<FriendData[]> {
    const { data } = await api.get('/friends');
    return data;
  }

  async createInviteUrl(): Promise<string> {
    const { data } = await api.post('/friends/invite-url');
    return data.url;
  }

  async getInviteData(token: string): Promise<InviteData> {
    const { data } = await api.post("/friends/invite/get", { token })
    return data
  }

  async acceptInvite(token: string): Promise<Friendship> {
    const { data } = await api.post("/friends/accept", { token })
    return data
  }
}

export const apiService = new ApiService();