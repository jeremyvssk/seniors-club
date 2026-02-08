export type Gender = "man" | "woman" | "other";
export type LookingFor = "love" | "friend" | "travel" | "open";
// Used for creating profile
export interface UserFormData {
  name: string;
  age: string;
  gender: Gender;
  hobbies: string[];
  lookingFor: LookingFor;
  lookingForGender: Gender[];
  bio: string;
  profilePicture?: File | null;
  latitude?: number;
  longitude?: number;
  maxRadiusKm: number;
}
// Used for editing profile
export interface EditProfileData {
  userId?: number;
  name: string;
  age: string;
  gender: Gender;
  hobbies: string[];
  lookingFor: LookingFor;
  lookingForGender: Gender[];
  bio: string;
  profilePicture?: File | null;      // New file if replacing
  profilePictureUrl?: string | null; // Current uploaded URL
  maxRadiusKm: number;
  email: string;
}

// Used when viewing other users' profiles (from API)
export interface ViewableProfile {
  name: string;
  age: string;
  gender: Gender;
  hobbies: string[];
  lookingFor: LookingFor;
  lookingForGender: Gender[];
  bio: string;
  profilePicture?: string | null;
  distanceKm?: number;      // Only show computed distance
  // NO latitude, longitude, maxRadiusKm
}
