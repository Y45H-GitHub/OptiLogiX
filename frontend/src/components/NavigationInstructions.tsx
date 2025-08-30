import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from 'lucide-react';
import { Product } from './types';

interface NavigationInstructionsProps {
  pathSteps: { x: number; y: number }[];
  currentProduct: Product | null;
}

const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({
  pathSteps,
  currentProduct,
}) => {
  if (pathSteps.length === 0) return null;

  const generateDirections = (steps: { x: number; y: number }[]): string[] => {
    if (steps.length === 0) return [];

    const directions: string[] = [];
    let currentDirection: 'up' | 'down' | 'left' | 'right' | null = null;
    let currentDistance = 0;

    for (let i = 0; i < steps.length; i++) {
      const currentStep = steps[i];
      const prevStep = i > 0 ? steps[i - 1] : null;

      if (prevStep) {
        let newDirection: 'up' | 'down' | 'left' | 'right' | null = null;
        if (currentStep.y < prevStep.y) {
          newDirection = 'up';
        } else if (currentStep.y > prevStep.y) {
          newDirection = 'down';
        } else if (currentStep.x < prevStep.x) {
          newDirection = 'left';
        } else if (currentStep.x > prevStep.x) {
          newDirection = 'right';
        }

        if (newDirection && newDirection !== currentDirection) {
          if (currentDirection) {
            directions.push(`Walk ${currentDistance} block${currentDistance > 1 ? 's' : ''} ${currentDirection}`);
          }
          currentDirection = newDirection;
          currentDistance = 1;
        } else if (newDirection === currentDirection) {
          currentDistance++;
        } else {
          // This case should ideally not happen with a valid path
          directions.push(`Move to (${currentStep.x}, ${currentStep.y})`);
        }
      } else {
        // First step, just note the starting point
        directions.push(`Start at (${currentStep.x}, ${currentStep.y})`);
      }
    }

    // Add the last segment of the path
    if (currentDirection) {
      directions.push(`Walk ${currentDistance} block${currentDistance > 1 ? 's' : ''} ${currentDirection}`);
    }

    return directions;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-indigo-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-indigo-600" />
          Navigation Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Step-by-Step Directions:</h4>
            <div className="space-y-2">
              {generateDirections(pathSteps).map((instruction, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <Badge className="bg-indigo-500 text-white min-w-[24px] h-6 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700">{instruction}</span>
                </div>
              ))} 
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-3">Path Summary:</h4>
            <div className="space-y-2 text-sm text-emerald-700">
              <div>📍 Total Steps: {pathSteps.length}</div>
              <div>🎯 Target: {currentProduct?.name}</div>
              <div>📦 Stock Available: {currentProduct?.stock}</div>
              <div>⏱️ Estimated Time: {Math.ceil(pathSteps.length * 0.5)} minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationInstructions;