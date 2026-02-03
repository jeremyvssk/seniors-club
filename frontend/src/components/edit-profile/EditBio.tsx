import React, { useEffect, useState } from "react";
import { UserFormData } from "../../types/User";
import api from "../../api/axios";

interface EditBioProps {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EditBio = ({ data, updateData, onNext, onBack }: EditBioProps) => {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // If user typed something, validate it

    if (data.bio.trim().length > 150) {
      alert("Bio must be no more than 150 characters");
      setSaving(false);
      return;
    }

    try {
      // Save the bio to backend
      await api.put("/me/profile", { bio: data.bio });
      onNext(); // Close the modal
    } catch (error) {
      console.error("Failed to save bio:", error);
      alert("Failed to save bio. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
        About Me
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="bio"
            className="block text-xl font-medium text-slate-500 mb-2"
          >
            Tell us about yourself
          </label>
          <textarea
            id="bio"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="What should others now about you..."
            rows={6}
            maxLength={150}
          />
          <p className="text-sm text-slate-500 mt-1">
            {data.bio.length}/150 characters
          </p>
        </div>

        <div className="space-y-2 md:space-y-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBio;
