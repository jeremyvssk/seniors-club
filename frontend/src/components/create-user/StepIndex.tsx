import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Hobbies from "./steps/Step2Hobbies";
import Step3Looking from "./steps/Step3Looking";
import Step4AboutMe from "./steps/Step4AboutMe";
import Step5ProfilePic from "./steps/Step5ProfilePic";
import Step6Location from "./steps/Step6Location";
import { UserFormData } from "../../types/User";
import api from "../../api/axios";

const CreateUser = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    age: "",
    gender: "",
    location: "",
    hobbies: [],
    lookingFor: "love",
    genderPreference: [],
    bio: "",
    profilePicture: null,
  });

  const totalSteps = 6;

  const updateFormData = (data: Partial<UserFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("=== SUBMITTING PROFILE ===");
      console.log("Form data:", formData);

      if (!formData.name.trim()) {
        alert("Name is required");
        setCurrentStep(1);
        return;
      }

      const age = parseInt(formData.age);
      if (!formData.age || isNaN(age) || age < 18) {
        alert("You must be at least 18 years old");
        setCurrentStep(1);
        return;
      }

      if (!formData.gender) {
        alert("Gender is required");
        setCurrentStep(1);
        return;
      }

      if (formData.hobbies.length === 0) {
        alert("Please select at least one hobby");
        setCurrentStep(2);
        return;
      }

      if (!formData.lookingFor) {
        alert("Please select what you are looking for");
        setCurrentStep(3);
        return;
      }
        if (!formData.location) {
        alert("Please allow your location to access the application");
        setCurrentStep(3);
        return;
      }

      // Bio is optional - no validation needed
      // Profile picture is optional - no validation needed

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to create a profile");
        navigate("/login");
        return;
      }

      const profileData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        location: formData.location.trim(),
        hobbies: formData.hobbies,
        lookingFor: formData.lookingFor,
      };

      console.log("Sending to API:", profileData);

      const response = await api.post("/me/profile", profileData);

      console.log("Profile created successfully:", response.data);

      if (formData.profilePicture) {
        console.log("Profile picture upload will be implemented later");
      }

      alert("Profile created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating profile:", error);

      if (error.response) {
        const status = error.response.status;
        console.error("Server status:", status);
        console.error("Server data:", error.response.data);

        if (status === 403) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (status === 401) {
          alert("Authentication failed. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to create profile";

        alert(`Error: ${message}`);
      } else if (error.request) {
        alert("Cannot connect to server. Please check your connection.");
      } else {
        alert(`An error occurred: ${error.message}`);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <Step2Hobbies
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step3Looking
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <Step4AboutMe
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step5ProfilePic
            data={formData}
            updateData={updateFormData}
            onSubmit={handleSubmit}
            onBack={prevStep}
          />
        );

              case 6:
        return (
          <Step6Location
            data={formData}
            updateData={updateFormData}
            onNext={handleSubmit}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-blue-500 to-slate-50 py-4 md:py-8">
      {/* Fixed height container for step indicator */}
      <div className="w-full max-w-2xl mx-auto px-4 mb-4 md:mb-8">
        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Content area - centered boxes */}
      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-md mx-auto">{renderStep()}</div>
      </div>
    </div>
  );
};

export default CreateUser;
