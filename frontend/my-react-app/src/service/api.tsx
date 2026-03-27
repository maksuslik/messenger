import { Profile, Chat, User, Message } from '../types.ts'
import api from '../AuthContext'

class ApiService {
  constructor() {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Профиль
  async getProfile(): Promise<Profile> {
    let token = localStorage.getItem('authToken');
    let login = localStorage.getItem('userLogin');

    if (!token) {
      try {
        const response = await api.post('/auth/init');
        token = response.data.token;
        login = response.data.login;

        if(token && login) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userLogin', login);
        }

        return { id: response.data.id, username: response.data.username }
      } catch (error) {
        console.error("Failed to register", error);
      }
    }

    const { data } = await api.get('/auth/me', {
      headers: {
        "X-Auth-Token": token
      }
    });
    return data;
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data } = await api.put('/profile', profile);
    return data;
  }

  async deleteProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data } = await api.delete('/profile', {
        data: profile
    });
    return data;
  }

  // Чаты
  async getChats(): Promise<Chat[]> {
    let token = localStorage.getItem('authToken');
    const { data } = await api.get('/chats/get', {
      headers: {
        "X-Auth-Token": token
      }
    });
    return data;
  }

  async createChat(name: string): Promise<Chat> {
    const { data } = await api.post('/chats', { name });
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
  async getFriends(): Promise<User[]> {
    const { data } = await api.get('/friends');
    return data;
  }

  async createInviteUrl(): Promise<string> {
    const { data } = await api.post('/friends/invite-url');
    return data.url;
  }
}

export const apiService = new ApiService();