import { UserFormData } from '../../../types/User';
import NextButton from '../../buttons/NextButton';
import PrevStepButton from '../../buttons/PrevStepButton';

interface Step2Props {
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

const Step2Hobbies = ({ data, updateData, onNext, onBack }: Step2Props) => {
  const toggleHobby = (hobby: string) => {
    const currentHobbies = data.hobbies;
    if (currentHobbies.includes(hobby)) {
      updateData({ hobbies: currentHobbies.filter(h => h !== hobby) });
    } else {
      updateData({ hobbies: [...currentHobbies, hobby] });
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-1 md:mb-2">
          What are your hobbies?
        </h2>
        <p className="text-center text-slate-600 mb-4 md:mb-6 text-sm">Select at least one</p>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Hobbies Grid - Compact on mobile */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {hobbiesOptions.map(hobby => (
              <button
                key={hobby}
                type="button"
                className={`h-12 md:h-14 px-2 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  data.hobbies.includes(hobby)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => toggleHobby(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>

          {/* Error message if no hobbies selected */}
          {data.hobbies.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-800 text-sm font-medium"> Please select at least one hobby</p>
            </div>
          )}

          {/* Selected Hobbies Count */}
          {data.hobbies.length > 0 && (
            <div className="text-center">
              <p className="text-xs md:text-sm text-slate-600">
                {data.hobbies.length} {data.hobbies.length === 1 ? 'hobby' : 'hobbies'} selected
              </p>
            </div>
          )}

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

export default Step2Hobbies;