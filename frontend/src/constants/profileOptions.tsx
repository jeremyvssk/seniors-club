import { Heart, Handshake, Plane, Compass } from "lucide-react";
import { Gender, LookingFor } from "../types/User";

// Shared by profile creation (steps) and profile editing, so both always offer the same choices

export const HOBBY_OPTIONS = [
  "Reading",
  "Gardening",
  "Walking",
  "Cooking",
  "Music",
  "Arts & Crafts",
  "Photography",
  "Travel",
  "Sports",
  "Dancing",
  "Board Games",
  "Volunteering",
];

export const LOOKING_FOR_OPTIONS: {
  value: LookingFor;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "love",
    label: "Love",
    icon: <Heart className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for a romantic relationship",
  },
  {
    value: "friend",
    label: "Friendship",
    icon: <Handshake className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for companionship and friendship",
  },
  {
    value: "travel",
    label: "Travel Buddy",
    icon: <Plane className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for someone to explore with",
  },
  {
    value: "open",
    label: "Still Figuring Out",
    icon: <Compass className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Open to different types of connections",
  },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "other", label: "Other" },
];
