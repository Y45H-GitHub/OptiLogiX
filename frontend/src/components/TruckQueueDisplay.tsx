import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock } from 'lucide-react';

interface TruckInQueue {
  truckId: string;
  arrivalTime: string;
  appointmentId: number;
}

interface TruckQueueDisplayProps {
  truckQueue: TruckInQueue[];
  selectedTruck: string | null;
  onSelectTruck: (truckId: string) => void;
}

const TruckQueueDisplay: React.FC<TruckQueueDisplayProps> = ({ truckQueue, selectedTruck, onSelectTruck }) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Truck className="w-6 h-6 text-cyan-600" />
          Truck Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {truckQueue.map((truck, index) => (
            <div
              key={truck.truckId}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${selectedTruck === truck.truckId 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400 shadow-lg' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:border-cyan-400 hover:shadow-md'
                }
              `}
              onClick={() => onSelectTruck(truck.truckId)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{truck.truckId}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(truck.arrivalTime)}
                  </div>
                </div>
                <Badge className={`
                  ${index === 0 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-200 text-gray-700'}
                `}>
                  #{index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TruckQueueDisplay;