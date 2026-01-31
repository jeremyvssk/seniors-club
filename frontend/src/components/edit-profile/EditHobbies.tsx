import React, { useEffect, useState } from "react";
import { UserFormData } from "../../types/User";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

interface EditHobbiesProps {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}




const hobbiesOptions = [
  'Reading',
  'Gardening',
  'Walking',
  'Cooking',
  'Music',
  'Arts & Crafts',
  'Photography',
  'Travel',
  'Sports',
  'Dancing',
  'Board Games',
  'Volunteering',
];

const EditHobbies: React.FC<EditHobbiesProps> = ({ data, updateData, onBack }) => {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // 1️⃣ Load existing hobbies
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<UserFormData>("/me/profile");
        setHobbies(res.data.hobbies || []);
      } catch (err) {
        setError("Failed to load hobbies");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);




const toggleHobby = (hobby: string) => {
  setHobbies(prev =>
    prev.includes(hobby)
      ? prev.filter(h => h !== hobby)
      : [...prev, hobby]
  );

  if (error) setError("");
};

const handleSave = async () => {
  if (hobbies.length === 0) {
    setError("Please select at least one hobby.");
    return;
  }

  try {
    await api.put("/me/profile", { hobbies });
    updateData({ hobbies }); // update parent state
    onBack(); // close overlay
  } catch {
    setError("Failed to save hobbies");
  }
};

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-1 md:mb-2">
          What are your hobbies?
        </h2>
        <p className="text-center text-slate-600 mb-4 md:mb-6 text-sm">Select at least one</p>


          {/* Hobbies Grid - Compact on mobile */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {hobbiesOptions.map(hobby => (
              <button
                key={hobby}
                type="button"
                className={`h-12 md:h-14 px-2 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  hobbies.includes(hobby)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => toggleHobby(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>

  
          {/* Selected Hobbies Count */}
          {hobbies.length > 0 && (
            <div className="text-center">
              <p className="text-xs md:text-sm text-slate-600">
                {hobbies.length} {hobbies.length === 1 ? 'hobby' : 'hobbies'} selected
              </p>
            </div>
          )}

           {/* Error Message */}
           {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base text-center">
              {error}
            </div>
          )}

          {/* save Button */}
          <div className="space-y-2 md:space-y-3">
<button
  type="button"
  onClick={handleSave}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
>
  Save hobbies
</button>
          </div>
       
      </div>
    </div>
  );
};

export default EditHobbies;