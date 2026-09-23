import React, { useState } from "react";
import { Check, Info } from "lucide-react";
import { HOBBY_OPTIONS } from "../../constants/profileOptions";
import { EditProfileData } from "../../types/User";
import api from "../../api/axios";
import { getErrorMessage } from "../../api/profiles";

interface EditHobbiesProps {
  data: EditProfileData;
  updateData: (data: Partial<EditProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// The pill picker, shared with sign-up step 2
export const HobbyPicker: React.FC<{ value: string[]; onToggle: (hobby: string) => void }> = ({ value, onToggle }) => (
  <div className="pick" role="group" aria-label="Hobbies">
    {HOBBY_OPTIONS.map((hobby) => {
      const on = value.includes(hobby);
      return (
        <button key={hobby} type="button" className="btn" aria-pressed={on} onClick={() => onToggle(hobby)}>
          {on && <Check className="s" />}
          {hobby}
        </button>
      );
    })}
  </div>
);

export const HobbyCount: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <p className="pick-count">{count} selected</p>
  ) : (
    <p className="pick-hint">
      <Info className="s" />
      Pick at least one so we can find people for you.
    </p>
  );

const EditHobbies: React.FC<EditHobbiesProps> = ({ data, updateData, onNext, onBack }) => {
  const [hobbies, setHobbies] = useState<string[]>(data.hobbies || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleHobby = (hobby: string) => {
    setHobbies((prev) => (prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]));
  };

  const handleSave = async () => {
    if (hobbies.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await api.put("/me/bio", { hobbies });
      updateData({ hobbies });
      onNext();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn’t save. Check your connection and try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form">
      {error && <div className="alert" role="alert">{error}</div>}
      <p className="form-sub">Pick as many as you like. People who share them show up first.</p>
      <HobbyPicker value={hobbies} onToggle={toggleHobby} />
      <HobbyCount count={hobbies.length} />
      <div className="modal-a">
        <button type="button" className="b-lg sec btn" onClick={onBack}>Cancel</button>
        <button type="button" className="b-lg pri btn" onClick={handleSave} disabled={saving || hobbies.length === 0}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditHobbies;
