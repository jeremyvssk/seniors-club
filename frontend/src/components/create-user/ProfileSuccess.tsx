import { Check } from "lucide-react";

interface ProfileSuccessProps {
  userName?: string;
}

const ProfileSuccess = ({ userName }: ProfileSuccessProps) => (
  <div className="center-page" role="status">
    <div className="empty">
      <div className="empty-ic done">
        <Check className="i" />
      </div>
      <h2>{userName ? `Welcome, ${userName}!` : "You’re all set!"}</h2>
      <p>Your profile is ready. Finding people near you…</p>
    </div>
  </div>
);

export default ProfileSuccess;
