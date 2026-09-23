import { StepProps } from "../StepIndex";
import { BIO_MAX } from "../../edit-profile/EditBio";

const Step4AboutMe = ({ data, updateData }: StepProps) => (
  <div className="form">
    <div className="field">
      <label htmlFor="bio">About me</label>
      <textarea
        id="bio"
        className="ta"
        value={data.bio}
        onChange={(e) => updateData({ bio: e.target.value })}
        placeholder="Early walks with my camera, afternoons in the garden. Looking for good company for both."
        rows={5}
        maxLength={BIO_MAX}
      />
      <p className={`count${data.bio.length >= BIO_MAX ? " full" : ""}`}>
        {data.bio.length} of {BIO_MAX} characters
      </p>
    </div>
  </div>
);

export default Step4AboutMe;
