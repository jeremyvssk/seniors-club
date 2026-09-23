import { HobbyCount, HobbyPicker } from '../../edit-profile/EditHobbies';
import { StepProps } from '../StepIndex';

const Step2Hobbies = ({ data, updateData }: StepProps) => {
  const toggleHobby = (hobby: string) => {
    const current = data.hobbies;
    updateData({ hobbies: current.includes(hobby) ? current.filter(h => h !== hobby) : [...current, hobby] });
  };

  return (
    <div className="form">
      <HobbyPicker value={data.hobbies} onToggle={toggleHobby} />
      <HobbyCount count={data.hobbies.length} />
    </div>
  );
};

export default Step2Hobbies;
