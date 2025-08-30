import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface AssignmentControlProps {
  selectedTruck: string | null;
  selectedDock: number | null;
  onAssignTruckToDock: () => void;
}

const AssignmentControl: React.FC<AssignmentControlProps> = ({
  selectedTruck,
  selectedDock,
  onAssignTruckToDock,
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ArrowRight className="w-6 h-6 text-blue-600" />
          Assignment Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600 mb-2">Selected Truck</div>
            <div className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 rounded-xl border-2 border-blue-300">
              {selectedTruck || 'None'}
            </div>
          </div>
          
          <ArrowRight className="w-8 h-8 text-gray-400" />
          
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600 mb-2">Selected Dock</div>
            <div className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-3 rounded-xl border-2 border-emerald-300">
              {selectedDock || 'None'}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={onAssignTruckToDock}
            disabled={!selectedTruck || !selectedDock}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-3 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Assign Dock
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentControl;