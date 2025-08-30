// components/RouteOptimizer/RouteResults.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';

interface RouteResultsProps {
  directions: string[];
  speakDirections: (step: string) => void;
}

const RouteResults = ({ directions, speakDirections }: RouteResultsProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [directions]);

  const handleNextStep = () => {
    if (currentStepIndex < directions.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSpeakCurrentStep = () => {
    if (directions[currentStepIndex]) {
      speakDirections(directions[currentStepIndex]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Directions</h2>
      {directions.length > 0 ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg text-center" dangerouslySetInnerHTML={{ __html: directions[currentStepIndex] }}></p>
          <div className="flex space-x-4">
            <Button onClick={handlePreviousStep} disabled={currentStepIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={handleSpeakCurrentStep}>
              <Volume2 className="mr-2 h-4 w-4" /> Speak
            </Button>
            <Button onClick={handleNextStep} disabled={currentStepIndex === directions.length - 1}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <p>No directions available.</p>
      )}
    </div>
  );
};

export default RouteResults;
