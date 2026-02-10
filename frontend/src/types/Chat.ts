export interface ChatResponse {
  chatId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserProfilePicture: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface PagedMessages {
  content: MessageResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
}