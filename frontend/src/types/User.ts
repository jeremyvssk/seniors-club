export interface UserFormData {
  name: string;
  age: string;
  gender: string;
  location: string;
  hobbies: string[];
  lookingFor: "love" | "friend" | "travel" | "open";
  bio: string;
  profilePicture?: File | null;
}
