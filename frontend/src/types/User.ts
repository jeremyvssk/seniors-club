export type Gender = "man" | "woman" | "other";
export type LookingFor = "love" | "friend" | "travel" | "open";

export interface UserFormData {
  name: string;
  age: string;
  gender: Gender;
  hobbies: string[];
  lookingFor: LookingFor;
  genderPreference: Gender[];
  bio: string;
  profilePicture?: File | null;
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number;
}
