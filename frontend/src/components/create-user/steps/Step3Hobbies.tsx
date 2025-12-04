import { useState } from 'react';
import { UserFormData } from '../../../types/User';
import NextButton from '../../buttons/NextButton';
import PrevStepButton from '../../buttons/PrevStepButton';

interface Step3Props {
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

const Step3Hobbies = ({ data, updateData, onNext, onBack }: Step3Props) => {
  const [customHobby, setCustomHobby] = useState('');

  const toggleHobby = (hobby: string) => {
    const currentHobbies = data.hobbies;
    if (currentHobbies.includes(hobby)) {
      updateData({ hobbies: currentHobbies.filter(h => h !== hobby) });
    } else {
      updateData({ hobbies: [...currentHobbies, hobby] });
    }
  };

  const addCustomHobby = () => {
    if (customHobby.trim() && !data.hobbies.includes(customHobby.trim())) {
      updateData({ hobbies: [...data.hobbies, customHobby.trim()] });
      setCustomHobby('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (data.hobbies.length === 0) {
      alert('Please select at least one hobby');
      return;
    }
    
    onNext();
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">What are your hobbies?</h2>
      <p className="text-center text-slate-600 mb-6">Select all that apply</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hobbies Grid */}
        <div className="grid grid-cols-2 gap-3">
          {hobbiesOptions.map(hobby => (
            <button
              key={hobby}
              type="button"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                data.hobbies.includes(hobby)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/10 border border-slate-500 text-slate-600 hover:bg-white/20'
              }`}
              onClick={() => toggleHobby(hobby)}
            >
              {hobby}
            </button>
          ))}
        </div>

        {/* Selected Hobbies */}
        {data.hobbies.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">
              Selected hobbies ({data.hobbies.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {data.hobbies.map(hobby => (
                <span
                  key={hobby}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => toggleHobby(hobby)}
                    className="hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex-col gap-4">
          
          <NextButton type="submit" className="flex-1 py-4 text-xl" onClick={onNext} />
          <PrevStepButton type="button" onClick={onBack} className="flex-1 py-4 text-xl" />
          
        </div>
      </form>
    </div>
  );
};

export default Step3Hobbies;