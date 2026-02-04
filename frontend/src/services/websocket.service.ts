import { Client, StompSubscription } from '@stomp/stompjs';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;

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
        
        onConnect: (frame) => {
          console.log('✅ CONNECTED! Frame:', frame);
          this.connected = true;

          resolve();
        },
        
      
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        },
        
        onWebSocketClose: () => {
          console.log('WebSocket closed');
          this.connected = false;
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

    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  subscribeToMessages(userId: string, callback: (message: any) => void): StompSubscription | null {
    if (!this.client || !this.connected) {
      console.error('❌ WebSocket not connected, cannot subscribe');
      return null;
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    const destination = `/topic/messages/${userId}`;
    console.log(`📡 Subscribing to: ${destination}`);

    this.messageSubscription = this.client.subscribe(destination, (message) => {
      console.log('📨 Received message:', message.body);
      const messageData = JSON.parse(message.body);
      callback(messageData);
    });

    return this.messageSubscription;
  }

  // Typing events
  subscribeToTyping(userId: string, callback: (data: { senderId: number; isTyping: boolean }) => void): void {
    if (!this.client || !this.connected) {
      console.error('❌ Cannot subscribe to typing: WebSocket not connected');
      return;
    }

    this.typingSubscription = this.client.subscribe(
      `/topic/typing/${userId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('❌ Failed to parse typing event:', error);
        }
      }
    );
  }

  // Send typing indicator
  sendTypingIndicator(recipientId: number, isTyping: boolean): void {
    if (!this.client || !this.connected) {
      console.error('❌ Cannot send typing indicator: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        recipientId,
        isTyping
      })
    });
  }


  sendMessage(recipientId: number, content: string) {
    if (!this.client || !this.connected) {
      console.error('❌ WebSocket not connected, cannot send message');
      throw new Error('WebSocket not connected');
    }

    console.log(`📤 Sending message to ${recipientId}: ${content}`);

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        recipientId,
        content,
      }),
    });
  }
}

export default new WebSocketService();