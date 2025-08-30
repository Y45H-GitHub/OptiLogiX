// components/RouteOptimizer/DirectionsDisplay.tsx
import { Button } from '@/components/ui/button';

interface DirectionsDisplayProps {
  directionsSteps: string[];
}

const DirectionsDisplay = ({ directionsSteps }: DirectionsDisplayProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">Step-by-Step Directions</h3>
      <ul className="list-disc pl-5 space-y-1">
        {directionsSteps.map((step: string, index: number) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
      {directionsSteps.length > 0 && (
        <Button>Speak Directions</Button>
      )}
    </div>
  );
};

export default DirectionsDisplay;
