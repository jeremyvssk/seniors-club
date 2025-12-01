import { useState } from 'react';
import StepProgress from './StepProgress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Location from './steps/Step2Location';
import Step3Hobbies from './steps/Step3Hobbies';
import Step4Looking from './steps/Step4Looking';
import Step5ProfilePic from './steps/Step5ProfilePic';
import { UserFormData } from '../../types/User';

const CreateUser = () => {
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
      // API call to create user
      console.log('Submitting user data:', formData);
      // await createUser(formData);
      // Navigate to dashboard or success page
    } catch (error) {
      console.error('Error creating user:', error);
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