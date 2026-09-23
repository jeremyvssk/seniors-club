import React, { useState, useEffect, useRef } from "react";
import { Camera, LogOut, Pencil, RefreshCw } from "lucide-react";
import { EditProfileData } from "../../../types/User";
import api from "../../../api/axios";
import { getErrorMessage } from "../../../api/profiles";
import { useChat } from "../../../context/ChatContext";
import ProfileCard from "../../ProfileCard";
import Modal from "../../ui/Modal";
import { EmptyState, LookingForChip, Spinner } from "../../ui/design";
import EditHobbies from "../../../components/edit-profile/EditHobbies";
import EditBio from "../../edit-profile/EditBio";
import EditLookingFor from "../../edit-profile/EditLookingFor";
import EditProfilePic from "../../edit-profile/EditProfilePic";
import { LogoutConfirm } from "../../app/AppShell";

type Editing = "photo" | "bio" | "hobbies" | "looking" | null;

const GENDER_WORD: Record<string, string> = { man: "Men", woman: "Women", other: "Other" };

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<EditProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(50);
  const [radiusState, setRadiusState] = useState<"" | "saving" | "saved" | "failed">("");
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const radiusTimer = useRef<number | null>(null);
  const { refreshMe } = useChat();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, bioRes, profileRes, emailRes] = await Promise.all([
        api.get("/me"),           // BasicUserInfoResponse: id, name, profilePictureUrl
        api.get("/me/bio"),       // UserBioResponse: age, gender, hobbies, lookingFor, lookingForGender, maxRadiusKm
        api.get("/me/profile"),   // AboutMeResponse: id, bio
        api.get("/me/email"),     // EmailResponse: email
      ]);
      setProfile({
        ...meRes.data,
        ...bioRes.data,
        ...profileRes.data,
        email: emailRes.data.email,
      });
      if (bioRes.data.maxRadiusKm) setRadius(bioRes.data.maxRadiusKm);
    } catch (err) {
      console.error("Error getting profile", err);
      setError(getErrorMessage(err, "Check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => {
      if (radiusTimer.current) clearTimeout(radiusTimer.current);
    };
  }, []);

  const update = (changes: Partial<EditProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...changes } : prev));
  };

  const closeAndRefresh = () => {
    setEditing(null);
    refreshMe();
  };

  const saveProfilePic = async (file: File | null) => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        const response = await api.put("/me/profile/picture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        update({ profilePictureUrl: response.data.profilePictureUrl || null });
      } else {
        await api.delete("/me/profile/picture");
        update({ profilePictureUrl: null });
      }
      closeAndRefresh();
    } catch (err) {
      console.error("Failed to update profile picture", err);
      alert(getErrorMessage(err, "Couldn’t save your photo. Try again."));
    }
  };

  // Save the radius a moment after the slider stops moving, not on every step
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRadius(value);
    setRadiusState("saving");
    if (radiusTimer.current) clearTimeout(radiusTimer.current);
    radiusTimer.current = window.setTimeout(async () => {
      try {
        await api.put("/me/bio", { maxRadiusKm: value });
        setRadiusState("saved");
      } catch (err) {
        console.error("Failed to update radius", err);
        setRadiusState("failed");
      }
    }, 600);
  };

  const header = (
    <header className="ph-h">
      <h1>My profile</h1>
      <button className="b-md btn" style={{ color: "var(--muted)" }} onClick={() => setConfirmLogout(true)}>
        <LogOut className="s" />
        <span>Log out</span>
      </button>
    </header>
  );

  if (loading) {
    return <div className="page">{header}<Spinner label="Loading your profile" /></div>;
  }

  if (error || !profile) {
    return (
      <div className="page">
        {header}
        <main className="page-empty">
          <EmptyState
            icon={<RefreshCw className="i" />}
            heading="Couldn’t load your profile"
            text={error || "Something went wrong."}
            action={<button className="b-lg pri btn" onClick={fetchProfile}><RefreshCw className="i" /><span>Try again</span></button>}
          />
        </main>
        {confirmLogout && <LogoutConfirm onClose={() => setConfirmLogout(false)} />}
      </div>
    );
  }

  const editBtn = (what: Editing, label: string) => (
    <button className="edit btn" onClick={() => setEditing(what)} aria-label={label}>
      <Pencil className="s" />
      <span>Edit</span>
    </button>
  );
  const fill = (radius / 300) * 100;
  const genders = (profile.lookingForGender || []).map((g) => GENDER_WORD[g] || g);

  return (
    <div className="page">
      {header}
      <main className="page-list scroll profile">
        <div className="profile-card">
          <ProfileCard
            className="still"
            profile={{
              name: profile.name,
              age: String(profile.age),
              gender: profile.gender,
              hobbies: [],
              lookingFor: profile.lookingFor,
              lookingForGender: profile.lookingForGender,
              bio: profile.bio,
              profilePicture: profile.profilePictureUrl,
            }}
            meta="Others only see how far away you are"
            hideHobbies
            topRight={
              <button className="gpill biob btn" onClick={() => setEditing("photo")}>
                <Camera className="s" />
                <span>{profile.profilePictureUrl ? "Change photo" : "Add photo"}</span>
              </button>
            }
          />
        </div>
        <p className="profile-note">This is how other people see your card.</p>

        <section className="sect">
          <div className="sect-h"><h3>About me</h3>{editBtn("bio", "Edit about me")}</div>
          {profile.bio ? (
            <p className="quote" style={{ fontSize: 25 }}>“{profile.bio}”</p>
          ) : (
            <p className="nobio">You haven’t written anything yet. A few words help people start a conversation.</p>
          )}
        </section>

        <section className="sect">
          <div className="sect-h">
            <h3>Hobbies <span style={{ color: "var(--muted)", fontWeight: 600 }}>· {profile.hobbies?.length || 0}</span></h3>
            {editBtn("hobbies", "Edit hobbies")}
          </div>
          {profile.hobbies?.length ? (
            <ul className="chips">{profile.hobbies.map((h) => <li key={h}>{h}</li>)}</ul>
          ) : (
            <p className="nobio">Add hobbies so we can find people who enjoy the same things.</p>
          )}
        </section>

        <section className="sect">
          <div className="sect-h"><h3>Looking for</h3>{editBtn("looking", "Edit what you are looking for")}</div>
          <div><LookingForChip kind={profile.lookingFor} variant="l" /></div>
          {genders.length > 0 && <p className="sect-note">Showing you: {genders.join(", ")}</p>}
        </section>

        <section className="sect">
          <div className="sect-h">
            <h3><label htmlFor="radius">How far away</label></h3>
            <span className="radius-v">{radius} km</span>
          </div>
          <input
            id="radius"
            className="range"
            type="range"
            min="1"
            max="300"
            value={radius}
            onChange={handleRadiusChange}
            style={{ background: `linear-gradient(to right, var(--accent) ${fill}%, #DCE3F0 ${fill}%)` }}
          />
          <p className="sect-note" role="status">
            {radiusState === "saving" && "Saving…"}
            {radiusState === "saved" && "Saved. We’ll show people within " + radius + " km."}
            {radiusState === "failed" && "Couldn’t save. Move the slider to try again."}
            {radiusState === "" && `We show people within ${radius} km of you.`}
          </p>
        </section>

        <section className="sect">
          <div className="sect-h"><h3>Account</h3></div>
          <p className="sect-note" style={{ fontSize: 16 }}>{profile.email}</p>
        </section>
      </main>

      {editing === "photo" && (
        <Modal title="Your photo" onClose={() => setEditing(null)}>
          <EditProfilePic current={profile.profilePictureUrl || null} onSave={saveProfilePic} onBack={() => setEditing(null)} />
        </Modal>
      )}
      {editing === "bio" && (
        <Modal title="About me" onClose={() => setEditing(null)}>
          <EditBio data={profile} updateData={update} onNext={closeAndRefresh} onBack={() => setEditing(null)} />
        </Modal>
      )}
      {editing === "hobbies" && (
        <Modal title="What do you enjoy?" onClose={() => setEditing(null)}>
          <EditHobbies data={profile} updateData={update} onNext={closeAndRefresh} onBack={() => setEditing(null)} />
        </Modal>
      )}
      {editing === "looking" && (
        <Modal title="What are you looking for?" onClose={() => setEditing(null)}>
          <EditLookingFor data={profile} updateData={update} onNext={closeAndRefresh} onBack={() => setEditing(null)} />
        </Modal>
      )}
      {confirmLogout && <LogoutConfirm onClose={() => setConfirmLogout(false)} />}
    </div>
  );
};

export default ProfileSection;
