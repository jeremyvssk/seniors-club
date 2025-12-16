interface NextButtonProps {
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const NextButton: React.FC<NextButtonProps> = ({
  type = "submit",
  className = "",
  disabled = false,
  children,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl text-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center group ${className}`}
    >
      {children || "Next"}
      <svg
        className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export default NextButton;
