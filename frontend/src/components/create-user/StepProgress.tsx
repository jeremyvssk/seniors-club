interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  return (
    <div className="w-full max-w-md mb-8">
      {/* Step counter */}
      <div className="flex justify-center items-center mb-6">
        <span className="text-lg font-semibold text-slate-700">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Step dots with connecting lines */}
      <div className="relative flex justify-between items-center -mb-4">
        
        {/* Connecting line background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        
        {/* Progress line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step dots */}
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              index + 1 <= currentStep
                ? 'bg-blue-600 text-white shadow-lg scale-110'
                : 'bg-white border-2 border-slate-300 text-slate-500'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;