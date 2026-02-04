import { useState, useRef, useEffect } from "react";
import { UserFormData } from "../../../types/User";
import PrevStepButton from "../../buttons/PrevStepButton";
import NextButton from "../../buttons/NextButton";


interface Step5Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step5ProfilePic = ({
  data,
  updateData,
  onNext,
  onBack,
}: Step5Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore preview when navigating back with existing profile picture
  useEffect(() => {
    if (data.profilePicture instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(data.profilePicture);
    }
  }, [data.profilePicture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      updateData({ profilePicture: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    updateData({ profilePicture: null });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const hasPhoto = preview !== null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-1 md:mb-2">
          Add a profile picture
        </h2>
        <p className="text-center text-slate-500 text-sm mb-4 md:mb-6">
          You can add this later if you prefer
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Upload Area - Balanced size */}
          <div className="w-full">
            {preview ? (
              <div className="space-y-2 md:space-y-3">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm">
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full px-4 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm md:text-base shadow-md hover:shadow-lg"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 md:p-12 text-center hover:border-slate-400 transition-colors bg-white/50">
                <div className="text-6xl md:text-7xl mb-3">👤</div>
                <p className="text-slate-700 mb-4 font-medium text-base">
                  No photo selected
                </p>
                <label
                  htmlFor="profilePic"
                  className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all cursor-pointer shadow-md hover:shadow-lg text-sm md:text-base"
                >
                  Choose Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Upload Info */}
          {!preview && (
            <div className="text-center">
              <p className="text-xs text-slate-500">JPG, PNG, GIF • Max 5MB</p>
            </div>
          )}

          <div className="space-y-2 md:space-y-3">
          <NextButton type="submit">
            {hasPhoto ? "Next" : "I'll do this later"}
          </NextButton>
          <PrevStepButton type="button" onClick={onBack} />
        </div>
        </form>
      </div>
    </div>
  );
};

export default Step5ProfilePic;
