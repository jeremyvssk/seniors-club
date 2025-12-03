import { UserFormData } from '../../../types/User';
import NextButton from '../../Buttons/NextButton';

interface Step1Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
}

const Step1BasicInfo = ({ data, updateData, onNext }: Step1Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.name || !data.age || !data.gender) {
      alert('Please fill in all fields');
      return;
    }
    
    onNext();
  };

  return (
    <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Tell us about yourself</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label htmlFor="name" className="block text-xl font-medium text-slate-500 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-xl font-medium text-slate-500 mb-2">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
            placeholder="Enter your age"
            min="18"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-xl font-medium text-slate-500 mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => updateData({ gender: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 focus:outline-none focus:ring-2 focus:ring-black/50"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <NextButton type="submit" className="py-4 text-xl" onClick={onNext} />
      </form>
    </div>
  );
};

export default Step1BasicInfo;