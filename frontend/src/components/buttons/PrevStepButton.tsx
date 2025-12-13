interface PrevStepButtonProps {
  onClick: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export const PrevStepButton: React.FC<PrevStepButtonProps> = ({ 
  onClick,
  type = 'button',
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full text-slate-600 hover:text-slate-900 py-3 px-6 text-lg font-medium transition-all flex items-center justify-center group ${className}`}
    >
      <svg 
        className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Previous Step
    </button>
  );
};

export default PrevStepButton;