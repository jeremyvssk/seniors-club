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
    
    if (!data.location) {
      alert('Please enter your location');
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
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
            placeholder="City, Country"
            required
          />
        </div>

        <div className="flex-col gap-4">
          <NextButton type="submit" className="py-4 text-xl" onClick={function (): void {
                  throw new Error('Function not implemented.');
              } } />
         <div className="flex-col  gap-4">   
          <PrevStepButton type="button" onClick={onBack} className="flex-1 py-4 text-xl " />
        </div>
        </div> 
      </form>
    </div>
    
  );
};

export default Step2Location;