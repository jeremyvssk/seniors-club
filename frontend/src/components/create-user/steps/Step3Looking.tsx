import { Gender, UserFormData } from "../../../types/User";
import NextButton from "../../buttons/NextButton";
import PrevStepButton from "../../buttons/PrevStepButton";
import { Heart, Handshake, Plane, Compass, VenusAndMars } from "lucide-react";

interface Step3Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const options = [
  {
    value: "love" as const,
    label: "Love",
    icon: <Heart className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for a romantic relationship",
  },
  {
    value: "friend" as const,
    label: "Friendship",
    icon: <Handshake className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for companionship and friendship",
  },
  {
    value: "travel" as const,
    label: "Travel Buddy",
    icon: <Plane className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Looking for someone to explore with",
  },
  {
    value: "open" as const,
    label: "Still Figuring Out",
    icon: <Compass className="w-6 h-6 md:w-8 md:h-8" />,
    description: "Open to different types of connections",
  },
];

const genderOptions: { value: Gender; label: string }[] = [ // Explicitly type the array
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "other", label: "Other" },
];

const Step3Looking = ({ data, updateData, onNext, onBack }: Step3Props) => {
  const toggleGenderPreference = (gender: Gender) => {
    const currentPreferences = data.genderPreference || [];
    const newPreferences = currentPreferences.includes(gender)
      ? currentPreferences.filter((g) => g !== gender)
      : [...currentPreferences, gender];
    updateData({ genderPreference: newPreferences });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.lookingFor) {
      alert("Please select what you are looking for");
      return;
    }

    if (!data.genderPreference || data.genderPreference.length === 0) {
      alert("Please select at least one gender preference");
      return;
    }

    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-1 md:mb-2">
          What are you looking for?
        </h2>
        <p className="text-center text-slate-600 mb-4 md:mb-6 text-sm">
          Choose one option
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* What are you looking for - Options */}
          <div className="space-y-2 md:space-y-3">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full min-h-[4.5rem] md:h-24 p-3 md:p-4 rounded-lg text-left transition-all border-2 ${
                  data.lookingFor === option.value
                    ? "bg-blue-600 text-white shadow-lg border-blue-600"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                }`}
                onClick={() => updateData({ lookingFor: option.value })}
              >
                <div className="flex items-center gap-2 md:gap-4 h-full">
                  <span
                    className={
                      data.lookingFor === option.value
                        ? "text-white"
                        : "text-blue-600"
                    }
                  >
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <h3
                      className={`text-base md:text-xl font-semibold mb-0.5 ${
                        data.lookingFor === option.value
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p
                      className={`text-xs md:text-sm ${
                        data.lookingFor === option.value
                          ? "text-blue-100"
                          : "text-slate-600"
                      }`}
                    >
                      {option.description}
                    </p>
                  </div>
                  {data.lookingFor === option.value && (
                    <span className="text-lg md:text-2xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Error message for lookingFor */}
          {!data.lookingFor && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-800 text-sm font-medium">Please select what you are looking for</p>
            </div>
          )}

          {/* Gender Preferences Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <VenusAndMars className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                Who Are You Looking For?
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {genderOptions.map((option) => {
                const isSelected = (data.genderPreference || []).includes(
                  option.value
                );
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`py-3 md:py-4 px-2 md:px-4 rounded-lg font-medium text-sm md:text-base transition-all border-2 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                    onClick={() => toggleGenderPreference(option.value)}
                  >
                    {option.label}
                    {isSelected && <span className="ml-1 md:ml-2">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Error message for gender preferences */}
            {(!data.genderPreference || data.genderPreference.length === 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center mt-3">
                <p className="text-red-800 text-sm font-medium"> Please select at least one gender preference</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-2 md:space-y-3">
            <NextButton type="submit" />
            <PrevStepButton type="button" onClick={onBack} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step3Looking;
