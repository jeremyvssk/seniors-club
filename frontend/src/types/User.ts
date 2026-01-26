export type Gender = "man" | "woman" | "other";
export type LookingFor = "love" | "friend" | "travel" | "open";

export interface UserFormData {
  userId?: number;
  name: string;
  age: string;
  gender: Gender;
  hobbies: string[];
  lookingFor: LookingFor;
  lookingForGender: Gender[];
  bio: string;
  profilePicture?: File | null | string;
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number;
}
