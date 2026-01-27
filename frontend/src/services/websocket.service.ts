import { Client, StompSubscription } from '@stomp/stompjs';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageSubscription: StompSubscription | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // ✅ Add logging to see what token we're using
      console.log('🔌 Connecting with token:', token.substring(0, 20) + '...');
      
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
        
        // ✅ More detailed logging
        onConnect: (frame) => {
          console.log('✅ CONNECTED! Frame:', frame);
          this.connected = true;
          resolve();
        },
        
        // ✅ Better error logging
        onStompError: (frame) => {
          console.error('❌ STOMP ERROR');
          console.error('Headers:', frame.headers);
          console.error('Body:', frame.body);
          reject(frame);
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