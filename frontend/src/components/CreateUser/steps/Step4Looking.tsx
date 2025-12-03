import { UserFormData } from '../../../types/User';
import NextButton from '../../Buttons/NextButton';
import PrevStepButton from '../../Buttons/PrevStepButton';
import { Heart, Handshake, Plane } from "lucide-react";

interface Step4Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const options = [
  {
    value: 'love' as const,
    label: 'Love',
    icon: <Heart />,
    description: 'Looking for a romantic relationship',
  },
  {
    value: 'friend' as const,
    label: 'Friend',
    icon: <Handshake />,
    description: 'Looking for companionship and friendship',
  },
  {
    value: 'travel' as const,
    label: 'Travel Buddy',
    icon: <Plane />,
    description: 'Looking for someone to explore with',
  },
];

const Step4Looking = ({ data, updateData, onNext, onBack }: Step4Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.lookingFor) {
      alert('Please select what you are looking for');
      return;
    }
    
    onNext();
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">What are you looking for?</h2>
      <p className="text-center text-slate-600 mb-6">Choose one option</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Options Grid */}
        <div className="space-y-3">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`w-full p-4 rounded-lg text-left transition-all ${
                data.lookingFor === option.value
                  ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-600'
                  : 'bg-white/10 border-2 border-slate-300 text-slate-700 hover:bg-white/20 hover:border-slate-400'
              }`}
              onClick={() => updateData({ lookingFor: option.value })}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${
                    data.lookingFor === option.value ? 'text-white' : 'text-slate-900'
                  }`}>
                    {option.label}
                  </h3>
                  <p className={`text-sm ${
                    data.lookingFor === option.value ? 'text-blue-100' : 'text-slate-600'
                  }`}>
                    {option.description}
                  </p>
                </div>
                {data.lookingFor === option.value && (
                  <span className="text-2xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex-col gap-4 pt-2">
          
          <NextButton type="submit" className="flex-1 py-4 text-xl" onClick={onNext} />
          <PrevStepButton type="button" onClick={onBack} className="flex-1 py-4 text-xl" />

        </div>
      </form>
    </div>
  );
};

export default Step4Looking;