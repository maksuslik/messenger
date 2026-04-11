// service/MatrixService.ts
import { createContext, useContext, useState } from 'react'
import * as matrixJsSdk from 'matrix-js-sdk';
import { Chat } from '../types';
import { IndexedDBStore, MemoryCryptoStore } from 'matrix-js-sdk';
import { CryptoEvent } from 'matrix-js-sdk/lib/crypto-api';

const MATRIX_HOMESERVER = 'http://193.42.126.166:8008';

type SyncState = 'ERROR' | 'PREPARED' | 'SYNCING' | 'CATCHUP' | 'RECONNECTING' | 'STOPPED';

interface MatrixContextType {
  isMatrixInitialized: boolean;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

class MatrixService {
  private client: matrixJsSdk.MatrixClient | null = null;
  private isInitialized = false;
  private syncReadyPromise: Promise<void> | null = null;
  private syncResolve: (() => void) | null = null;
  private syncState: SyncState | null = null;
  private syncStateListeners: Set<(state: SyncState) => void> = new Set();
  private newRoomListeners: Set<(roomId: string) => void> = new Set();

  async initialize(matrixUserId: string, matrixAccessToken: string, deviceId: string): Promise<void> {
    if (this.isInitialized) return;

    /*const store = new IndexedDBStore({
      indexedDB: window.indexedDB,
      localStorage: window.localStorage,
      dbName: "matrix-sync-" + matrixUserId
    });*/

    this.syncReadyPromise = new Promise<void>((resolve, reject) => {
      this.syncResolve = resolve;
    });

    this.client = matrixJsSdk.createClient({
      baseUrl: MATRIX_HOMESERVER,
      accessToken: matrixAccessToken,
      userId: matrixUserId,
      //store: store,
      //cryptoStore: new MemoryCryptoStore(),
      deviceId: deviceId
      //useE2eEncryption: true,
    });

    this.client.on(matrixJsSdk.ClientEvent.Sync, (state: SyncState, prevState: SyncState | null) => {
      this.syncState = state;
      
      this.syncStateListeners.forEach(listener => listener(state));

      if (state === 'SYNCING' && prevState !== 'SYNCING') {
          setTimeout(() => {
            console.log('sync');
            this.syncResolve?.();
          }, 2000);
      }
    });

    await this.client.initRustCrypto();

    this.client.startClient({
      initialSyncLimit: 50,
    });

    this.client.on(matrixJsSdk.RoomEvent.MyMembership, async (room, membership, oldMembership) => {
            console.log(`Membership changed: ${room.roomId} ${oldMembership} → ${membership}`);

            if (membership === 'invite' && oldMembership !== 'invite') {
                console.log(`🎉 Received invite to ${room.roomId}`);
                await this.client?.joinRoom(room.roomId);
            }

            this.newRoomListeners.forEach(listener => {
                    listener(room.roomId);
                });
        });

    this.isInitialized = true;
    console.log('Matrix клиент инициализирован');
  }

  async createRoom(name?: string, roomType?: string, invite: string[] = []): Promise<string> {
    if (!this.client) throw new Error('Клиент не инициализирован');

    const room = await this.client.createRoom({
      name,
      invite,
      is_direct: roomType === 'DM',
      preset: roomType === 'DM' ? matrixJsSdk.Preset.TrustedPrivateChat : matrixJsSdk.Preset.PublicChat
    });

    const roomId = room.room_id;

    await this.client.sendStateEvent(
      roomId,
      matrixJsSdk.EventType.RoomEncryption,
      { algorithm: 'm.megolm.v1.aes-sha2' },
      ''
    );

    return roomId;
  }

  async sendMessage(roomId: string, content: string): Promise<void> {
    if (!this.client) throw new Error('Клиент не инициализирован');

    const room = this.client.getRoom(roomId);
    if(!room)
      return;

    if (room.getMyMembership() !== "join") {
        console.log("joining room...");
        await this.client.joinRoom(roomId);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    await this.client.sendTextMessage(roomId, content);
  }

  async getMessages(roomId: string, limit: number = 50): Promise<any[]> {
    if (!this.client) throw new Error("Клиент не инициализирован");

    const room = this.client.getRoom(roomId);
    if (!room) return [];

    const events = room.getLiveTimeline().getEvents();
    
    return events
      .slice(-limit)
      .filter(event => event.getType() === 'm.room.message')
      .map(event => ({
        id: event.getId(),
        sender: event.getSender(),
        content: event.getContent().body,
        timestamp: event.getTs(),
        isEncrypted: event.isEncrypted(),
      }));
  }

  async waitForSync(timeoutMs: number = 30000): Promise<void> {
        if (!this.syncReadyPromise) {
            throw new Error('Matrix not initialized');
        }

        const timeout = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('Sync timeout')), timeoutMs);
        });

        return Promise.race([this.syncReadyPromise, timeout]);
    }

    isSyncReady(): boolean {
        return this.syncState === 'SYNCING' || this.syncState === 'PREPARED';
    }

    getSyncState(): SyncState | null {
        return this.syncState;
    }

  subscribeToSyncState(listener: (state: SyncState) => void): () => void {
        this.syncStateListeners.add(listener);
        if (this.syncState) {
            listener(this.syncState);
        }
        return () => {
            this.syncStateListeners.delete(listener);
        };
    }

  subscribeToNewRooms(callback: (roomId: string) => void): () => void {
        this.newRoomListeners.add(callback);
        
        return () => {
            this.newRoomListeners.delete(callback);
        };
    }

  subscribeToRoom(roomId: string, callback: (message: any) => void): () => void {
    if (!this.client) throw new Error('Клиент не инициализирован');

    const listener = (event: any) => {
      if (event.getRoomId() === roomId && event.getType() === 'm.room.message') {
        callback({
          id: event.getId(),
          sender: event.getSender(),
          content: event.getContent().body,
          timestamp: event.getTs(),
          isEncrypted: event.isEncrypted(),
        });
      }
    };

    this.client.on(matrixJsSdk.RoomEvent.Timeline, listener);

    return () => {
      this.client?.removeListener(matrixJsSdk.RoomEvent.Timeline, listener);
    };
  }

  subscribeToRoomMessages(
        roomId: string, 
        callback: (message: any) => void
    ): () => void {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        const listener = (event: any) => {
          console.log("receiveeee " + event.getType() + " " + event.getContent().body);
            if (event.getRoomId() !== roomId) {
                return;
            }
            console.log(event.getType())

            if (event.getType() !== 'm.room.message' && event.getType() !== 'm.room.encrypted') {
                return;
            }
            console.log(2)

            ///if (event.getSender() === this.client?.getUserId()) {
                ///return;
            //}
            console.log(3)

            const content = event.getContent();
            if (content['msgtype'] === 'm.bad.encrypted') {
                console.warn('⚠️ Could not decrypt message');
                return;
            }
            console.log(4);

            const message = {
                id: event.getId(),
                sender: event.getSender(),
                content: content.body,
                timestamp: event.getTs(),
                isEncrypted: event.isEncrypted(),
            };

            console.log('📬 Message event received:', message);
            callback(message);
        };

        this.client.on(matrixJsSdk.RoomEvent.Timeline, listener);
        console.log("subscribed");

        return () => {
            this.client?.removeListener(matrixJsSdk.RoomEvent.Timeline, listener);
            console.log("unsubscribed");
        };
    }

  async findUser(userId: string): Promise<string | null> {
    if (!this.client) throw new Error('Клиент не инициализирован');

    try {
      const profile = await this.client.getProfileInfo(userId);
      return profile.displayname || userId;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    if (this.client) {
      this.client.stopClient();
      this.client = null;
      this.isInitialized = false;
      console.log((await window.indexedDB.databases()).map((db) => db.name));
      (await window.indexedDB.databases()).forEach((db) => {
        if(db.name)
          window.indexedDB.deleteDatabase(db.name);
      })
    }
  }

  getClient(): matrixJsSdk.MatrixClient | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.getSyncState() === matrixJsSdk.SyncState.Syncing || false;
  }
}

export const useMatrix = () => {
  const context = useContext(MatrixContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const matrixService = new MatrixService();