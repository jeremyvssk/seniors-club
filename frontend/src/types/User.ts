export type Gender = "man" | "woman" | "other";
export type LookingFor = "love" | "friend" | "travel" | "open";
// Used for creating, editing profile
export interface UserFormData {
  userId?: number;
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
  maxRadiusKm?: number;
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
