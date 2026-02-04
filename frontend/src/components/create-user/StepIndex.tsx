import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Hobbies from "./steps/Step2Hobbies";
import Step3Looking from "./steps/Step3Looking";
import Step4AboutMe from "./steps/Step4AboutMe";
import Step5ProfilePic from "./steps/Step5ProfilePic";
import Step6Location from "./steps/Step6Location";
import ProfileSuccess from "./ProfileSuccess";
import { UserFormData } from "../../types/User";
import api from "../../api/axios";
import LogOutButton from "../buttons/LogOutButton";

const CreateUser = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    age: "",
    gender: "" as any,
    hobbies: [],
    lookingFor: "love",
    lookingForGender: [],
    bio: "",
    profilePicture: null,
    latitude: undefined,
    longitude: undefined,
    maxRadiusKm: 50,
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

      if (!formData.lookingForGender || formData.lookingForGender.length === 0) {
        alert("Please select at least one gender preference");
        setCurrentStep(3);
        return;
      }

      if (!formData.latitude || !formData.longitude || formData.latitude === 0 || formData.longitude === 0) {
        alert("Please allow location access");
        setCurrentStep(6);
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

      setIsSubmitting(true);

      const formDataToSend = new FormData();
    
      // Add all text fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('lookingFor', formData.lookingFor);
      formDataToSend.append('lookingForGender', formData.lookingForGender.join(','));
      formDataToSend.append('bio', formData.bio || '');
      formDataToSend.append('latitude', formData.latitude.toString());
      formDataToSend.append('longitude', formData.longitude.toString());
      
      // Handle maxRadiusKm
      if (formData.maxRadiusKm !== undefined && formData.maxRadiusKm !== null && formData.maxRadiusKm > 0) {
        formDataToSend.append('maxRadiusKm', formData.maxRadiusKm.toString());
      }
      formDataToSend.append('hobbies', formData.hobbies.join(','));
      // Add profile picture if exists
      if (formData.profilePicture instanceof File) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      } else {
        console.log("No profile picture to upload");
      }

      // ========================================
      // Send FormData with multipart header
      // ========================================
      const response = await api.post("/me/profile", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Profile created successfully:", response.data);
      // wait 2 seconds to show success state, then navigate

      // Only show success screen after successful response
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/explore");
      }, 1800);

    } catch (error: any) {
      // Reset loading state on error
      setIsSubmitting(false);
      setIsSuccess(false);
      console.error("Error creating profile:", error);

      if (error.response) {
        const status = error.response.status;
        console.error("Server status:", status);
        console.error("Server data:", error.response.data);

        if (status === 403) {
          // Check if it's actually a token issue or validation error
          const errorMessage = error.response.data?.message || error.response.data?.error;
          
          if (errorMessage && errorMessage.toLowerCase().includes('token')) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            // It's a validation error, not token issue
            alert(`Error: ${errorMessage || 'Failed to create profile'}`);
          }
          return;
        }

        if (status === 401) {
          alert("Authentication failed. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (status === 400) {
          // Bad request - validation error
          const message = error.response.data?.message || error.response.data?.error;
          alert(`Validation Error: ${message}`);
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
  // how success component only after successful API call
  if (isSuccess) {
    return <ProfileSuccess userName={formData.name} />;
  }

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
            onNext={nextStep}
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
      
      <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                <LogOutButton onClick={() => console.log('Logout clicked')} />
            </div>    
      
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