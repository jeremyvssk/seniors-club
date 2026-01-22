import { Client } from '@stomp/stompjs';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        // Use native WebSocket instead of SockJS
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
          console.log('WebSocket Connected');
          this.connected = true;
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          reject(frame);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
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
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  subscribeToMessages(userId: string, callback: (message: any) => void) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    return this.client.subscribe(`/user/${userId}/queue/messages`, (message) => {
      const messageData = JSON.parse(message.body);
      callback(messageData);
    });
  }

  sendMessage(recipientId: number, content: string) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

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