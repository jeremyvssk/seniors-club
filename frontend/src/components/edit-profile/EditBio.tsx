import React, { useState } from "react";
import { EditProfileData } from "../../types/User";
import api from "../../api/axios";
import { getErrorMessage } from "../../api/profiles";

interface EditBioProps {
  data: EditProfileData;
  updateData: (data: Partial<EditProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BIO_MAX = 150;

const EditBio = ({ data, updateData, onNext, onBack }: EditBioProps) => {
  const [bio, setBio] = useState(data.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/me/profile", { bio: bio.trim() });
      updateData({ bio: bio.trim() });
      onNext();
    } catch (err) {
      console.error("Failed to save bio:", err);
      setError(getErrorMessage(err, "Couldn’t save. Check your connection and try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="alert" role="alert">{error}</div>}
      <div className="field">
        <label htmlFor="bio">A few words about you</label>
        <textarea
          id="bio"
          className="ta"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What do you enjoy? What kind of company are you looking for?"
          rows={5}
          maxLength={BIO_MAX}
          autoFocus
        />
        <p className={`count${bio.length >= BIO_MAX ? " full" : ""}`}>
          {bio.length} of {BIO_MAX} characters
        </p>
      </div>
      <div className="modal-a">
        <button type="button" className="b-lg sec btn" onClick={onBack}>Cancel</button>
        <button type="submit" className="b-lg pri btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
};

export default EditBio;
