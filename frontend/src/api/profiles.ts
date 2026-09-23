import axios from 'axios';
import api from './axios';
import { ViewableProfile } from '../types/User';

export interface ProfileWithId extends ViewableProfile {
  userId: number;
}

// Loads everything a ProfileCard needs for one user (3 requests in parallel)
export const fetchViewableProfile = async (userId: number): Promise<ProfileWithId> => {
  const [user, profile, bio] = await Promise.all([
    api.get(`/users/${userId}`),
    api.get(`/users/${userId}/profile`),
    api.get(`/users/${userId}/bio`),
  ]);

  return {
    userId,
    name: user.data.name,
    age: bio.data.age.toString(),
    gender: bio.data.gender,
    bio: profile.data.bio,
    hobbies: bio.data.hobbies,
    lookingFor: bio.data.lookingFor,
    lookingForGender: bio.data.lookingForGender,
    profilePicture: user.data.profilePictureUrl || null,
    distanceKm: bio.data.distanceKm,
    isOnline: profile.data.isOnline,
  };
};

// Pulls the backend's error message out of an axios error, if there is one
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};
