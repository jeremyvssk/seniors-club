interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  return (
    <div className="w-full px-4 mb-8">
      {/* Step counter */}
      <div className="flex justify-center items-center mb-6">
        <span className="text-base md:text-lg font-semibold text-slate-800 bg-white/70 px-4 py-1.5 rounded-full shadow-sm">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Step dots with connecting lines */}
      <div className="relative flex justify-between items-center">
        
        {/* Background line - darker grey for visibility */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-500/50 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Progress line - vibrant blue */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-linear-to-r from-blue-600 to-blue-500 -translate-y-1/2 z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step dots */}
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
              index + 1 <= currentStep
                ? 'bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-white'
                : 'bg-white border-2 border-slate-400 text-slate-600 shadow-md'
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