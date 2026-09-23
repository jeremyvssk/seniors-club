import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, LogOut } from "lucide-react";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Hobbies from "./steps/Step2Hobbies";
import Step3Looking from "./steps/Step3Looking";
import Step4AboutMe from "./steps/Step4AboutMe";
import Step5ProfilePic from "./steps/Step5ProfilePic";
import Step6Location from "./steps/Step6Location";
import ProfileSuccess from "./ProfileSuccess";
import { Gender, UserFormData } from "../../types/User";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { useLogout } from "../../hooks/useLogout";
import { getToken } from "../../lib/session";
import { BIO_MAX } from "../edit-profile/EditBio";

export interface StepProps {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
}

const STEPS = [
  { heading: "Tell us about you", sub: "Your first name and age are shown on your card." },
  { heading: "What do you enjoy?", sub: "Pick as many as you like. People who share them show up first." },
  { heading: "What are you looking for?", sub: "Each choice has its own colour, so people can tell at a glance." },
  { heading: "A few words about you", sub: "Optional, but it makes it much easier for people to say hello." },
  { heading: "Add a photo", sub: "Optional. People are more likely to connect when they can see you." },
  { heading: "Where are you?", sub: "We use this to find people near you. Others only ever see the distance, never where you live." },
];

const CreateUser = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    age: "",
    gender: "" as Gender,
    hobbies: [],
    lookingFor: "friend",
    lookingForGender: [],
    bio: "",
    profilePicture: null,
    latitude: undefined,
    longitude: undefined,
    maxRadiusKm: 50,
  });

  const totalSteps = STEPS.length;

  const updateFormData = (data: Partial<UserFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const age = parseInt(formData.age);
  // Whether "Next" is allowed on each step. The step itself explains what is missing
  const stepValid = [
    formData.name.trim().length >= 2 && !isNaN(age) && age >= 18 && age <= 120 && Boolean(formData.gender),
    formData.hobbies.length > 0,
    Boolean(formData.lookingFor) && formData.lookingForGender.length > 0,
    formData.bio.length <= BIO_MAX,
    true,
    Boolean(formData.latitude && formData.longitude),
  ][currentStep - 1];

  const logout = useLogout();

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("age", formData.age);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("lookingFor", formData.lookingFor);
      formDataToSend.append("lookingForGender", formData.lookingForGender.join(","));
      formDataToSend.append("bio", formData.bio.trim() || "");
      formDataToSend.append("latitude", String(formData.latitude));
      formDataToSend.append("longitude", String(formData.longitude));
      if (formData.maxRadiusKm > 0) {
        formDataToSend.append("maxRadiusKm", formData.maxRadiusKm.toString());
      }
      formDataToSend.append("hobbies", formData.hobbies.join(","));
      if (formData.profilePicture instanceof File) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      await api.post("/me/profile", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSuccess(true);
      setTimeout(() => navigate("/explore"), 1800);
    } catch (err) {
      const error = err as AxiosError<{ message?: string; error?: string }>;
      const message = error.response?.data?.message || error.response?.data?.error;
      if (error.response) {
        setSubmitError(message || "We couldn’t create your profile. Please try again.");
      } else {
        setSubmitError("We can’t reach the server. Check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <ProfileSuccess userName={formData.name.trim()} />;
  }

  const next = () => {
    if (!stepValid) return;
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const props = { data: formData, updateData: updateFormData };
  const step = [
    <Step1BasicInfo {...props} />,
    <Step2Hobbies {...props} />,
    <Step3Looking {...props} />,
    <Step4AboutMe {...props} />,
    <Step5ProfilePic {...props} />,
    <Step6Location {...props} />,
  ][currentStep - 1];

  const optionalEmpty =
    (currentStep === 4 && !formData.bio.trim()) || (currentStep === 5 && !formData.profilePicture);
  const nextLabel = isSubmitting
    ? "Creating your profile…"
    : currentStep === totalSteps
    ? "Finish"
    : optionalEmpty
    ? "Skip for now"
    : "Next";

  return (
    <div className="flow">
      <header className="ph-h" style={{ paddingLeft: 8 }}>
        {currentStep > 1 ? (
          <button className="b-md btn" style={{ color: "var(--ink)", padding: "0 12px" }} onClick={() => setCurrentStep((s) => s - 1)}>
            <ChevronLeft className="s" />
            <span>Back</span>
          </button>
        ) : (
          <button className="b-md btn" style={{ color: "var(--muted)", padding: "0 12px" }} onClick={logout}>
            <LogOut className="s" />
            <span>Log out</span>
          </button>
        )}
        <span className="ph-note">Step {currentStep} of {totalSteps}</span>
      </header>
      <div className="flow-pad">
        <div className="steps" aria-hidden="true">
          {STEPS.map((_, k) => (
            <span key={k} className={k < currentStep ? "on" : ""} />
          ))}
        </div>
      </div>
      <main className="flow-main">
        <div>
          <h1 className="flow-h1">{STEPS[currentStep - 1].heading}</h1>
          <p className="flow-sub">{STEPS[currentStep - 1].sub}</p>
        </div>
        {submitError && <div className="alert" role="alert">{submitError}</div>}
        {step}
      </main>
      <div className="flow-foot">
        <button className="b-lg pri btn" style={{ width: "100%" }} onClick={next} disabled={!stepValid || isSubmitting}>
          <span>{nextLabel}</span>
          {!isSubmitting && <ArrowRight className="i" />}
        </button>
      </div>
    </div>
  );
};

export default CreateUser;
