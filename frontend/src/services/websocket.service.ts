import { Client, StompSubscription } from '@stomp/stompjs';
import { MessageResponse } from '../types';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private readReceiptsSubscription: StompSubscription | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentToken: string | null = null;

  connect(token: string): Promise<void> {
    if (this.client?.connected && this.currentToken === token) {
      console.log('Already connected with same token, reusing connection');
      return Promise.resolve();
    }

    if (this.currentToken !== token) {
      console.log('Token changed, disconnecting old connection');
      this.disconnect();
    }

    this.currentToken = token;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'ws://localhost:3001/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        debug: (str) => {
          console.log('STOMP:', str);
        },
        
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        
        onConnect: () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected successfully');
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          
          if (frame.headers['message']?.includes('JWT expired') || 
              frame.headers['message']?.includes('ExecutorSubscribableChannel')) {
            console.error('Token expired, redirecting to login');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
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
        
        onWebSocketClose: (event) => {
          this.connected = false;
          console.log('WebSocket closed:', event.reason);
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

  subscribeToTopic(topic: string, callback: (data: any) => void): void {
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