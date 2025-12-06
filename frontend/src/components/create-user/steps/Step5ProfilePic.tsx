import { useState, useRef } from 'react';
import { UserFormData } from '../../../types/User';
import PrevStepButton from '../../buttons/PrevStepButton';
import CompleteProfileButton from '../../buttons/CompleteProfile';




interface Step5Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const Step5ProfilePic = ({ data, updateData, onSubmit, onBack }: Step5Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      updateData({ profilePicture: file });
      
      // Create preview
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
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Add a profile picture</h2>
      <p className="text-center text-slate-600 mb-6">Optional - You can skip this step</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Area */}
        <div className="w-full">
          {preview ? (
            <div className="space-y-4">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                <img 
                  src={preview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Remove Photo
              </button>
            </div>
          ) : (
            <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors bg-white/10">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-slate-600 mb-4">No photo selected</p>
              
            </div>
          )}
        </div>

        {/* Upload Info */}
        <div className="text-center space-y-1">
        <label 
                htmlFor="profilePic" 
                className="inline-block px-6 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer -mt-4"
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

          <p className="text-sm text-slate-500">Supported formats: JPG, PNG, GIF</p>
          <p className="text-sm text-slate-500">Maximum size: 5MB</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-col gap-4 pt-2">
          
          <CompleteProfileButton type="submit" className="flex-1 py-4 text-xl" />
          <PrevStepButton type="button" onClick={onBack} className="flex-1 py-4 text-xl" />

        </div>
      </form>
    </div>
  );
};

export default Step5ProfilePic;