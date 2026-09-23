import { Check } from "lucide-react";
import { GENDER_OPTIONS } from "../../../constants/profileOptions";
import { StepProps } from "../StepIndex";

const Step1BasicInfo = ({ data, updateData }: StepProps) => {
  const age = parseInt(data.age);
  const ageProblem =
    data.age && (isNaN(age) || age < 18) ? "You need to be at least 18." : data.age && age > 120 ? "Check your age." : "";
  const nameShort = data.name.length > 0 && data.name.trim().length < 2;

  return (
    <div className="form">
      <div className="field">
        <label htmlFor="name">First name</label>
        <div className={`inp${nameShort ? " err" : ""}`}>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="For example, Kaja"
            maxLength={50}
            autoComplete="given-name"
            autoFocus
          />
        </div>
        {nameShort && <p className="field-err">At least 2 letters, please.</p>}
      </div>

      <div className="field">
        <label htmlFor="age">Age</label>
        <div className={`inp${ageProblem ? " err" : ""}`} style={{ maxWidth: 160 }}>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            placeholder="67"
            min={18}
            max={120}
          />
        </div>
        {ageProblem && <p className="field-err">{ageProblem}</p>}
      </div>

      <div className="field">
        <p className="field-l">I am a</p>
        <div className="pick" role="radiogroup" aria-label="Gender">
          {GENDER_OPTIONS.map((option) => {
            const on = data.gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className="btn"
                role="radio"
                aria-checked={on}
                aria-pressed={on}
                onClick={() => updateData({ gender: option.value })}
              >
                {on && <Check className="s" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
