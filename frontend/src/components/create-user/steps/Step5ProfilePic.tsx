import { PhotoPicker } from "../../edit-profile/EditProfilePic";
import { StepProps } from "../StepIndex";

const Step5ProfilePic = ({ data, updateData }: StepProps) => (
  <PhotoPicker current={data.profilePicture} onChange={(file) => updateData({ profilePicture: file })} />
);

export default Step5ProfilePic;
