export interface Chat {
    chatId: number;
    otherUserId: number;
    otherUserName: string;
    otherUserProfilePicture: string | null;
    lastMessage: string | null;
    lastMessageAt: string;
    unreadCount: number;
  }
  
  export interface Message {
    id: number;
    chatId: number;
    senderId: number;
    senderName: string;
    content: string;
    createdAt: string;
    isRead: boolean;
  }