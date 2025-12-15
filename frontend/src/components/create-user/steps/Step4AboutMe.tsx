import { UserFormData } from "../../../types/User";
import NextButton from "../../buttons/NextButton";
import PrevStepButton from "../../buttons/PrevStepButton";

interface Step4Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}



const Step4AboutMe = ({ data, updateData, onNext, onBack }: Step4Props) => {
  const hasBio = data.bio.trim().length > 0;
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // If user typed something, validate it
  if (hasBio) {
    if (data.bio.trim().length < 10) {
      alert("Bio must be at least 10 characters long");
      return;
    }

    if (data.bio.trim().length > 200) {
      alert("Bio must be no more than 200 characters");
      return;
    }
  }

  // Empty OR valid bio → continue
  onNext();
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
            maxLength={200}
          />
          <p className="text-sm text-slate-500 mt-1">
            {data.bio.length}/200 characters
          </p>
        </div>

        <div className="space-y-2 md:space-y-3">
          {hasBio ? (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-4 px-6 rounded-xl text-base md:text-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-slate-700 text-white py-3 md:py-4 px-6 rounded-xl text-base md:text-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              I’ll do this later
            </button>
          )}

          <PrevStepButton type="button" onClick={onBack} />
        </div>
      </form>
    </div>
  );
};
export default Step4AboutMe;
