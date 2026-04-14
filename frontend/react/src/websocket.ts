import { io, Socket } from 'socket.io-client';
import { Message } from './types'

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('https://msldev.ru/', {
      auth: { token },
    });

    this.socket.on('new-message', (message: Message) => {
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}