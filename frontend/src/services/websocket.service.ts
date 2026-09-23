import { Client, StompSubscription } from '@stomp/stompjs';
import { MessageResponse } from '../types';
import { clearSession } from '../lib/session';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private readReceiptsSubscription: StompSubscription | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentToken: string | null = null;
  private statusListeners = new Set<(connected: boolean) => void>();

  // Lets the UI show a "reconnecting" banner when the socket drops
  onStatusChange(listener: (connected: boolean) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setConnected(value: boolean) {
    this.connected = value;
    this.statusListeners.forEach((listener) => listener(value));
  }

  connect(token: string): Promise<void> {
    if (this.client?.connected && this.currentToken === token) {
      return Promise.resolve();
    }

    if (this.currentToken !== token) {
      this.disconnect();
    }

    this.currentToken = token;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'ws://localhost:3001/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        
        onConnect: () => {
          this.setConnected(true);
          this.reconnectAttempts = 0;
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          
          if (frame.headers['message']?.includes('JWT expired') || 
              frame.headers['message']?.includes('ExecutorSubscribableChannel')) {
            console.error('Token expired, redirecting to login');
            clearSession();
            window.location.href = '/login';
          }
          
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            reject(new Error('Failed to connect after max attempts'));
          }
        },
        
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        },
        
        onWebSocketClose: () => {
          this.setConnected(false);
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }

    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = null;
    }

    if (this.readReceiptsSubscription) {
      this.readReceiptsSubscription.unsubscribe();
      this.readReceiptsSubscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.currentToken = null;
    }
  }

  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  subscribeToMessages(userId: string, callback: (message: MessageResponse) => void): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe to messages: not connected');
      return;
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messageSubscription = this.client.subscribe(`/topic/messages/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToReadReceipts(userId: string, callback: (data: { chatId: number; readBy: number }) => void): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe to read receipts: not connected');
      return;
    }

    this.readReceiptsSubscription = this.client.subscribe(`/topic/read-receipts/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToTyping(userId: string, callback: (data: { senderId: number; isTyping: boolean }) => void): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe to typing: not connected');
      return;
    }

    this.typingSubscription = this.client.subscribe(`/topic/typing/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToTopic<T = unknown>(topic: string, callback: (data: T) => void): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe to topic: not connected');
      return;
    }
    
    this.client.subscribe(topic, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  sendTypingIndicator(recipientId: number, isTyping: boolean): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send typing indicator: not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ recipientId, isTyping }),
    });
  }

  sendMessage(recipientId: number, content: string): void {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ recipientId, content }),
    });
  }
}

export const websocketService = new WebSocketService();