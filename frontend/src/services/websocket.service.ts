import { Client, StompSubscription } from '@stomp/stompjs';
import { MessageResponse } from '../types';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private connectionListeners: Array<() => void> = [];
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private readReceiptsSubscription: StompSubscription | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'ws://localhost:3001/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          this.connected = true;
          console.log('WebSocket connected');
          
          // Notify all listeners that connection is ready
          this.connectionListeners.forEach(listener => listener());
          
          resolve();
        },
        
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        },
        
        onWebSocketClose: () => {
          this.connected = false;
          console.log('WebSocket disconnected');
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
    }
    
    this.connectionListeners = [];
  }

  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  // Register callback to be notified when WebSocket connects
  onConnect(callback: () => void): () => void {
    this.connectionListeners.push(callback);
    
    // If already connected, call immediately
    if (this.isConnected()) {
      callback();
    }
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  subscribeToMessages(userId: string, callback: (message: MessageResponse) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
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
      console.error('WebSocket not connected');
      return;
    }

    this.readReceiptsSubscription = this.client.subscribe(`/topic/read-receipts/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToTyping(userId: string, callback: (data: { senderId: number; isTyping: boolean }) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.typingSubscription = this.client.subscribe(`/topic/typing/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToTopic(topic: string, callback: (data: any) => void): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe - not connected');
      return;
    }
    
    this.client.subscribe(topic, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  sendTypingIndicator(recipientId: number, isTyping: boolean): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
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