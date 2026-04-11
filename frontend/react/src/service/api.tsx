import {
  Profile,
  Chat,
  User,
  Message,
  Friendship,
  InviteData,
  FriendData,
  ChatInviteData
} from "../types.ts";
import api from "../AuthContext";
import { matrixService } from "./MatrixService";

class ApiService {
  constructor() {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        config.headers["Authorization"] = token;
      }
      return config;
    });
  }

  // Профиль
  async getProfile(): Promise<User> {
    let token = localStorage.getItem("authToken");

    if (!token) {
      try {
        const response = await api.post("/auth/init");
        await this.setData(response.data);

        return { id: response.data.id, username: response.data.username };
      } catch (error) {
        console.error("Failed to register", error);
      }
    }

    const { data } = await api.get("/auth/me");
    await this.setData(data)
    return data;
  }

  async login(username: string, password: string): Promise<User> {
    const { data } = await api.post("/auth/login", {
      username: username,
      password: password,
    });

    await this.setData(data);
    return data;
  }

  async signUp(username: string, password: string): Promise<User> {
    const { data } = await api.post("/auth/signup", {
      username: username,
      password: password,
    });

    await this.setData(data);
    return data;
  }

  async setData(data: any) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("matrixUserId", data.matrixUserId);
    localStorage.setItem("matrixAccessToken", data.matrixAccessToken);

    console.log(data.matrixUserId);
    await matrixService.initialize(data.matrixUserId, data.matrixAccessToken, data.matrixDeviceId);
  }

  async updateProfile(profile: Partial<User>): Promise<User> {
    const { data } = await api.patch("/profile", profile);
    return data;
  }

  async deleteProfile(): Promise<Profile> {
    const { data } = await api.delete("/profile");
    return data;
  }

  async getMatrixId(id: string): Promise<string> {
    const { data } = await api.post("/profile/matrix", { id })
    return data;
  }

  // Чаты
  async getChats(): Promise<Chat[]> {
    const { data } = await api.get("/chats/get");
    return data;
  }

  async getChatByMatrixId(id: string): Promise<Chat> {
    const { data } = await api.post("/chats/get/matrix", { id });
    return data;
  }

  async createChat(name: string, matrixRoomId: string): Promise<Chat> {
    const { data } = await api.post("/chats/create", { name: name, matrixRoomId: matrixRoomId });
    return data;
  }

  async getChatInviteData(id: string): Promise<ChatInviteData> {
    const { data } = await api.post("/chats/invite/get", { id });
    return data;
  }

  async acceptChatInvite(id: string): Promise<Chat> {
    const { data } = await api.post("/chats/join", { id });
    return data;
  }

  async updateChat(chat: Partial<Chat>): Promise<Chat> {
    const { data } = await api.patch("/chats/update", chat);
    return data;
  }

  async deleteChat(chatId: string): Promise<Chat> {
    const { data } = await api.delete("/chats/delete", {
      data: {
        id: chatId
      }
    })
    return data;
  }

  async leaveChat(chatId: string): Promise<Chat> {
    const { data } = await api.post("/chats/leave", { id: chatId })
    return data;
  }

  // Сообщения
  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await api.get("/chats/" + chatId + "/messages");
    return data;
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const { data } = await api.post("/chats/" + chatId + "/messages", { content });
    return data;
  }

  // Друзья
  async getFriends(): Promise<FriendData[]> {
    const { data } = await api.get("/friends");
    return data;
  }

  async removeFriend(id: string): Promise<User> {
    const { data } = await api.post("/friends/remove", { id })
    return data;
  }

  async createInviteUrl(): Promise<string> {
    const { data } = await api.post("/friends/invite-url");
    return data.url;
  }

  async getInviteData(token: string): Promise<InviteData> {
    const { data } = await api.post("/friends/invite/get", { token });
    return data;
  }

  async acceptInvite(token: string, matrixChatId: string): Promise<Friendship> {
    const { data } = await api.post("/friends/accept", { token, matrixChatId });
    return data;
  }
}

export const apiService = new ApiService();
