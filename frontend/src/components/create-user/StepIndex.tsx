import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgress from './StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Location from './steps/Step2Location';
import Step3Hobbies from './steps/Step3Hobbies';
import Step4Looking from './steps/Step4Looking';
import Step5ProfilePic from './steps/Step5ProfilePic';
import { UserFormData } from '../../types/User';
import api from '../../api/axios';



const CreateUser = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    age: '',
    gender: '',
    location: '',
    hobbies: [],
    lookingFor: 'love',
    profilePicture: null,
  });

  

  const totalSteps = 5;

  const updateFormData = (data: Partial<UserFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting profile data:', formData);

      // Validate required fields
      if (!formData.name || !formData.age || !formData.gender || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.hobbies.length < 5) {
        alert('Please select at least 5 hobbies');
        return;
      }

      // Prepare data for API
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        location: formData.location,
        hobbies: formData.hobbies,
        lookingFor: formData.lookingFor
      };

      console.log('Sending to API:', profileData);

      // Call API to save profile
      const response = await api.post('/me/profile', profileData);
      
      console.log('Profile created successfully:', response.data);
      alert('Profile created successfully!');
      
      // Redirect to home/recommendations page
      navigate('/');
      
    } catch (error: any) {
      console.error('Error creating profile:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        alert(error.response.data.message || 'Failed to create profile. Please try again.');
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server');
        alert('Cannot connect to server. Please check your connection.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        alert('An error occurred. Please try again.');
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
          <Step2Location
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step3Hobbies
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step4Looking
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
      default:
        return null;
    }
  };

  return (
    <div className="create-user-container">
      <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
      {renderStep()}
    </div>
  );
};

export default CreateUser;

//kas siin peaks olema see, et ta saadab data backendi tagasi