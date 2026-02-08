import React, { useState, useEffect } from "react";
import { User, Edit } from "lucide-react";
import { EditProfileData } from "../../../types/User";
import api from "../../../api/axios";
import EditHobbies from "../../../components/edit-profile/EditHobbies";
import EditBio from "../../edit-profile/EditBio";
import EditLookingFor from "../../edit-profile/EditLookingFor";
import EditProfilePic from "../../edit-profile/EditProfilePic";

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<EditProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(50);
  const [editingHobbies, setEditingHobbies] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingLookingFor, setEditingLookingFor] = useState(false);
  const [editingProfilePic, setEditingProfilePic] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Call all FOUR endpoints
        const [meRes, bioRes, profileRes, emailRes] = await Promise.all([
          api.get("/me"),           // BasicUserInfoResponse: id, name, profilePictureUrl
          api.get("/me/bio"),       // UserBioResponse: age, gender, hobbies, lookingFor, lookingForGender, maxRadiusKm
          api.get("/me/profile"),   // AboutMeResponse: id, bio
          api.get("/me/email"),     // EmailResponse: email
        ]);

        console.log("✅ /me response:", meRes.data);
        console.log("✅ /me/bio response:", bioRes.data);
        console.log("✅ /me/profile response:", profileRes.data);
        console.log("✅ /me/email response:", emailRes.data);

        // Merge all responses into profile state
        setProfile({
          ...meRes.data,           // id, name, profilePictureUrl
          ...bioRes.data,          // age, gender, hobbies, lookingFor, lookingForGender, maxRadiusKm
          ...profileRes.data,      // bio
          email: emailRes.data.email,  // Add email to profile
        });

        if (bioRes.data.maxRadiusKm) {
          setRadius(bioRes.data.maxRadiusKm);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error getting profile", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePicUpdate = async (file: File | null) => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await api.put("/me/profile/picture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.profilePictureUrl) {
          setProfile({
            ...profile!,
            profilePictureUrl: response.data.profilePictureUrl,
          });
        }
      } else {
        await api.delete("/me/profile/picture");
        setProfile({ ...profile!, profilePictureUrl: null });
      }

      setEditingProfilePic(false);
    } catch (err) {
      console.error("Failed to update profile picture", err);
      alert("Failed to update profile picture");
    }
  };

  const handleRadiusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRadius(value);

    try {
      await api.put("/me/bio", { maxRadiusKm: value });
    } catch (err) {
      console.error("Failed to update radius", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-xl p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-xl p-6 flex items-center justify-center">
        <p className="text-red-500">{error || "Profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 lg:p-6 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
                          rounded-full bg-linear-to-br from-blue-200 to-purple-200 
                          flex items-center justify-center shadow-lg"
            >
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl.toString()}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-gray-400" />
              )}
            </div>

            <button
              onClick={() => setEditingProfilePic(true)}
              className="bg-gray-100 rounded-full 
                             px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                             shadow-md text-gray-600 hover:text-blue-700 hover:bg-gray-200 
                             transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="text-xs sm:text-sm md:text-base font-medium">
                Edit Photo
              </span>
            </button>
          </div>

          {editingProfilePic && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <div
                className="bg-white rounded-2xl p-4 shadow-lg w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <EditProfilePic
                  data={profile}
                  updateData={(updated) => {
                    setProfile({ ...profile, ...updated });
                  }}
                  onNext={async () => {
                    try {
                      if (profile.profilePicture) {
                        await handleProfilePicUpdate(profile.profilePicture);
                      } else if (profile.profilePicture === null) {
                        await handleProfilePicUpdate(null);
                      }
                      setEditingProfilePic(false);
                    } catch (err) {
                      console.error("Failed to save profile picture", err);
                    }
                  }}
                  onBack={() => setEditingProfilePic(false)}
                />
              </div>
            </div>
          )}

          {/* Name, Age, and Email */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {profile.name}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600">
              {profile.age} years old
            </p>
            <p className="text-base sm:text-xl md:text-2xl text-gray-600">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Hobbies Section */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                Hobbies
              </h2>
              <button
                className="text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setEditingHobbies(true)}
              >
                <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {profile.hobbies.map((hobby, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                   bg-blue-100 text-blue-700 
                   rounded-full text-xs sm:text-sm md:text-base 
                   font-medium"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {editingHobbies && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <div
              className="bg-white rounded-2xl p-4 shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <EditHobbies
                data={profile}
                updateData={(updated) => setProfile({ ...profile, ...updated })}
                onNext={async () => {
                  try {
                    await api.put("/me/bio", {
                      hobbies: profile.hobbies,
                    });
                    setEditingHobbies(false);
                  } catch (err) {
                    console.error("Failed to save hobbies", err);
                    alert("Failed to save changes");
                  }
                }}
                onBack={() => setEditingHobbies(false)}
              />
            </div>
          </div>
        )}

        {/* Looking For Section */}
        {profile.lookingFor && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                Looking For
              </h2>
              <button
                className="text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setEditingLookingFor(true)}
              >
                <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </button>
            </div>
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                           bg-purple-100 text-purple-700 
                           rounded-full text-xs sm:text-sm md:text-base 
                           font-medium capitalize"
            >
              {profile.lookingFor}
            </span>
          </div>
        )}

        {editingLookingFor && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <div
              className="bg-white rounded-2xl p-4 shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <EditLookingFor
                data={profile}
                updateData={(updated) => setProfile({ ...profile, ...updated })}
                onNext={async () => {
                  try {
                    await api.put("/me/bio", {
                      lookingFor: profile.lookingFor,
                    });
                    setEditingLookingFor(false);
                  } catch (err) {
                    console.error("Failed to save looking for", err);
                    alert("Failed to save changes");
                  }
                }}
                onBack={() => setEditingLookingFor(false)}
              />
            </div>
          </div>
        )}

        {/* Gender Section */}
        {profile.gender && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">
              Gender
            </h2>
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                           bg-blue-100 text-blue-700 
                           rounded-full text-xs sm:text-sm md:text-base 
                           font-medium capitalize"
            >
              {profile.gender}
            </span>
          </div>
        )}

        {/* Bio Section */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
              About Me
            </h2>
            <button
              className="text-gray-400 hover:text-blue-600 transition-colors"
              onClick={() => setEditingBio(true)}
            >
              <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
            </button>
          </div>
          {profile.bio ? (
            <p
              className="text-gray-700 leading-5 sm:leading-6 md:leading-7 
                text-xs sm:text-sm md:text-base lg:text-lg text-left 
                wrap-break-word overflow-wrap-anywhere max-w-full"
            >
              {profile.bio}
            </p>
          ) : (
            <p className="text-gray-400 text-sm italic">
              No bio added yet. Click the edit button to add one!
            </p>
          )}
        </div>

        {editingBio && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <div
              className="bg-white rounded-2xl p-4 shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <EditBio
                data={profile}
                updateData={(updated) => setProfile({ ...profile, ...updated })}
                onNext={async () => {
                  try {
                    await api.put("/me/profile", {
                      bio: profile.bio,
                    });
                    setEditingBio(false);
                  } catch (err) {
                    console.error("Failed to save bio", err);
                    alert("Failed to save changes");
                  }
                }}
                onBack={() => setEditingBio(false)}
              />
            </div>
          </div>
        )}

        {/* Radius Slider Section */}
        <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <label className="block text-base md:text-lg font-medium text-slate-700">
              Match Radius
            </label>
            <span className="text-blue-600 font-bold text-xl md:text-2xl">
              {radius} km
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="300"
            value={radius}
            onChange={handleRadiusChange}
            className="w-full h-2 md:h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(radius / 300) * 100}%, #e2e8f0 ${(radius / 300) * 100}%, #e2e8f0 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-slate-500 mt-1 md:mt-2">
            <span>1 km</span>
            <span>150 km</span>
            <span>300 km</span>
          </div>

          <p className="text-xs md:text-sm text-slate-600 text-center mt-2 md:mt-3">
            Show matches within {radius} km
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;