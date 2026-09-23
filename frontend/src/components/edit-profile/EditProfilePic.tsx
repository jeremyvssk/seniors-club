import React, { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

interface PhotoPickerProps {
  // Current photo: an uploaded URL or a file picked earlier
  current?: string | File | null;
  onChange: (file: File | null) => void;
}

// Big preview plus choose/remove. Used by sign-up step 5 and the profile page
export const PhotoPicker: React.FC<PhotoPickerProps> = ({ current, onChange }) => {
  const [preview, setPreview] = useState<string | null>(typeof current === "string" ? current : null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (current instanceof File) {
      const url = URL.createObjectURL(current);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(typeof current === "string" ? current : null);
  }, [current]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn’t a photo. Choose a JPG or PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That photo is too large. Choose one under 5 MB.");
      return;
    }
    setError("");
    onChange(file);
  };

  return (
    <div className="photo">
      {error && <div className="alert" role="alert">{error}</div>}
      <div className="photo-box">
        {preview ? <img src={preview} alt="Your photo" /> : <Camera className="i" aria-hidden="true" />}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr" id="photo-file" />
      <div className="photo-a">
        <button type="button" className="b-lg pri btn" onClick={() => inputRef.current?.click()}>
          <Camera className="i" />
          <span>{preview ? "Choose another" : "Choose a photo"}</span>
        </button>
        {preview && (
          <button type="button" className="b-lg sec btn" onClick={() => onChange(null)}>
            <Trash2 className="i" />
            <span>Remove</span>
          </button>
        )}
      </div>
      <p className="form-sub" style={{ textAlign: "center" }}>JPG or PNG, up to 5 MB. A clear photo of your face works best.</p>
    </div>
  );
};

interface EditProfilePicProps {
  current: string | null;
  onSave: (file: File | null) => Promise<void>;
  onBack: () => void;
}

const EditProfilePic: React.FC<EditProfilePicProps> = ({ current, onSave, onBack }) => {
  const [picked, setPicked] = useState<string | File | null>(current);
  const [saving, setSaving] = useState(false);
  const changed = picked !== current;

  const save = async () => {
    setSaving(true);
    try {
      await onSave(picked instanceof File ? picked : null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form">
      <PhotoPicker current={picked} onChange={setPicked} />
      <div className="modal-a">
        <button type="button" className="b-lg sec btn" onClick={onBack}>Cancel</button>
        <button type="button" className="b-lg pri btn" onClick={save} disabled={!changed || saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePic;
