import { UserFormData } from '../../../types/User';
import NextButton from '../../buttons/NextButton';
import PrevStepButton from '../../buttons/PrevStepButton';

interface Step2Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Location = ({ data, updateData, onNext, onBack }: Step2Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.location.trim()) {
      alert('Please enter your location');
      return;
    }

    if (data.location.trim().length < 3) {
      alert('Please enter a valid location (e.g., Tallinn, Estonia)');
      return;
    }
    
    onNext();
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Where are you located?</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="location" className="block text-xl font-medium text-slate-500 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Tallinn, Estonia"
            minLength={3}
            maxLength={100}
            required
          />
          <p className="text-sm text-slate-500 mt-1">Enter your city and country</p>
        </div>

        <div className="space-y-3">
          {/* REMOVED onClick from NextButton! */}
          <NextButton type="submit" />
          <PrevStepButton type="button" onClick={onBack} />
        </div>
      </form>
    </div>
  );
};

export default Step2Location;