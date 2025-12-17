export interface UserFormData {
    name: string;
    age: string;
    gender?: string;
    location: string;
    hobbies: string[];
    lookingFor: 'Love' | 'Friend' | 'Travel' | 'Open';
    profilePicture?: File | null;
    bio?: string;
  }