export interface ConnectionRequest {
  requestId: number;
  userId: number;
  name: string;
  age: string;
  profilePictureUrl: string | null;
  bio: string;
  requestedAt: string;
}

export interface MatchedUser {
  userId: number;
  name: string;
  age: number;
  profilePictureUrl: string | null;
  bio: string;
  matchedAt: string;
}