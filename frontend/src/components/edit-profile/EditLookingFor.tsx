import React, { useState } from "react";
import { Check } from "lucide-react";
import { EditProfileData, Gender, LookingFor } from "../../types/User";
import api from "../../api/axios";
import { getErrorMessage } from "../../api/profiles";
import { GENDER_OPTIONS } from "../../constants/profileOptions";
import { LookingForIcon } from "../ui/design";
import { LF_DESC, LF_LABEL } from "../../lib/format";

interface EditLookingForProps {
  data: EditProfileData;
  updateData: (data: Partial<EditProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const KINDS: LookingFor[] = ["love", "friend", "travel", "open"];

// The four colour-coded options, shared with sign-up step 3
export const LookingForPicker: React.FC<{ value: LookingFor; onChange: (v: LookingFor) => void }> = ({ value, onChange }) => (
  <div role="group" aria-label="Looking for" className="lfopts">
    {KINDS.map((k) => {
      const sel = value === k;
      return (
        <button key={k} type="button" className={`lfopt btn ${k}`} aria-pressed={sel} onClick={() => onChange(k)}>
          <span className="lfi"><LookingForIcon kind={k} /></span>
          <span>
            <b>{LF_LABEL[k]}</b>
            <small>{LF_DESC[k]}</small>
          </span>
          <span className="tick">{sel && <Check className="s" />}</span>
        </button>
      );
    })}
  </div>
);

export const GenderPicker: React.FC<{ value: Gender[]; onToggle: (g: Gender) => void }> = ({ value, onToggle }) => (
  <div className="pick" role="group" aria-label="Who you would like to meet">
    {GENDER_OPTIONS.map((option) => {
      const on = value.includes(option.value);
      return (
        <button key={option.value} type="button" className="btn" aria-pressed={on} onClick={() => onToggle(option.value)}>
          {on && <Check className="s" />}
          {option.value === "man" ? "Men" : option.value === "woman" ? "Women" : "Other"}
        </button>
      );
    })}
  </div>
);

const EditLookingFor = ({ data, updateData, onNext, onBack }: EditLookingForProps) => {
  const [lookingFor, setLookingFor] = useState<LookingFor>(data.lookingFor || "open");
  const [genders, setGenders] = useState<Gender[]>(data.lookingForGender || []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleGender = (g: Gender) =>
    setGenders((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (genders.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await api.put("/me/bio", { lookingFor, lookingForGender: genders });
      updateData({ lookingFor, lookingForGender: genders });
      onNext();
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError(getErrorMessage(err, "Couldn’t save. Check your connection and try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="alert" role="alert">{error}</div>}
      <LookingForPicker value={lookingFor} onChange={setLookingFor} />
      <div className="field">
        <p className="field-l">Who would you like to meet?</p>
        <GenderPicker value={genders} onToggle={toggleGender} />
        {genders.length === 0 && <p className="pick-hint">Pick at least one.</p>}
      </div>
      <div className="modal-a">
        <button type="button" className="b-lg sec btn" onClick={onBack}>Cancel</button>
        <button type="submit" className="b-lg pri btn" disabled={saving || genders.length === 0}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
};

export default EditLookingFor;
