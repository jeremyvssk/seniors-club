export interface UserFormData {
  name: string;
  age: string;
  gender: string;
  hobbies: string[];
  lookingFor: "love" | "friend" | "travel" | "open";
  genderPreference: string[];
  bio: string;
  profilePicture?: File | null;
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number | null; // null = unlimited
}
