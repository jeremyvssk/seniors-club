import { Gender } from "../../../types/User";
import { GenderPicker, LookingForPicker } from "../../edit-profile/EditLookingFor";
import { StepProps } from "../StepIndex";

const Step3Looking = ({ data, updateData }: StepProps) => {
  const toggleGender = (gender: Gender) => {
    const current = data.lookingForGender || [];
    updateData({
      lookingForGender: current.includes(gender) ? current.filter((g) => g !== gender) : [...current, gender],
    });
  };

  return (
    <div className="form">
      <LookingForPicker value={data.lookingFor} onChange={(lookingFor) => updateData({ lookingFor })} />
      <div className="field">
        <p className="field-l">Who would you like to meet?</p>
        <GenderPicker value={data.lookingForGender} onToggle={toggleGender} />
        {data.lookingForGender.length === 0 && <p className="pick-hint">Pick at least one.</p>}
      </div>
      <p className="form-sub">You can change this at any time from your profile.</p>
    </div>
  );
};

export default Step3Looking;
