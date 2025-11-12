import { Check } from 'lucide-react';

type Step = 'request' | 'fear' | 'value' | 'reality' | 'summary' | 'build' | 'output' | 'final';

interface ProgressIndicatorProps {
  currentStep: Step;
  completedSteps: Step[];
  onStepClick?: (step: Step) => void;
}

const steps: { key: Step; label: string }[] = [
  { key: 'request', label: 'Request' },
  { key: 'fear', label: 'Fear Dig' },
  { key: 'value', label: 'Value Dig' },
  { key: 'reality', label: 'Reality Dig' },
  { key: 'summary', label: 'Summary' },
  { key: 'build', label: 'Build' },
  { key: 'output', label: 'Output' },
  { key: 'final', label: 'Final' },
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, completedSteps, onStepClick }) => {
  const getStepIndex = (step: Step) => steps.findIndex(s => s.key === step);
  const currentIndex = getStepIndex(currentStep);

  const handleStepClick = (step: Step) => {
    // Allow clicking on completed steps or the current step
    if (completedSteps.includes(step) || step === currentStep) {
      onStepClick?.(step);
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-magnus-coral transition-all duration-300 -z-10"
          style={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isPast = index < currentIndex;
          const isClickable = isCompleted || isCurrent;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(step.key)}
                disabled={!isClickable}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isCompleted
                    ? 'bg-magnus-green text-white hover:bg-magnus-green-dark cursor-pointer'
                    : isCurrent
                    ? 'bg-magnus-coral text-white ring-4 ring-magnus-coral ring-opacity-30 cursor-pointer'
                    : isPast
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } ${isClickable ? 'hover:scale-110' : ''}`}
              >
                {isCompleted ? <Check size={20} /> : index + 1}
              </button>
              <button
                type="button"
                onClick={() => handleStepClick(step.key)}
                disabled={!isClickable}
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isCurrent 
                    ? 'text-magnus-coral' 
                    : isCompleted 
                    ? 'text-magnus-green hover:text-magnus-green-dark' 
                    : 'text-gray-500'
                } ${isClickable ? 'cursor-pointer hover:underline' : 'cursor-not-allowed'}`}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;

