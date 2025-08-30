import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface Dock {
  id: number;
  status: string; // e.g., 'available', 'occupied'
  currentTruck: string | null;
  assignedTime: string | null;
  type: 'loading' | 'unloading' | 'priority';
}

interface DockStatusGridProps {
  docks: Dock[];
  onAssignTruckToDock: () => void;
  onSelectDock: (dockId: number) => void;
  selectedDock: number | null;
}

const DockStatusGrid: React.FC<DockStatusGridProps> = ({ docks, onAssignTruckToDock, onSelectDock, selectedDock }) => {
  return (
    <Card className="lg:col-span-2 bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-teal-600" />
          Dock Status Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {docks.map((dock) => (
            <div
              key={dock.id}
              className={`
                p-6 rounded-2xl border-2 transition-all duration-300
                ${dock.status === 'occupied'
                  ? 'bg-gradient-to-br from-red-100 to-pink-100 border-red-300 shadow-lg'
                  : selectedDock === dock.id
                    ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-400 shadow-lg'
                    : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-300 shadow-lg hover:shadow-xl cursor-pointer'
                }
              `}
              onClick={() => {
                if (dock.status === 'available') {
                  onSelectDock(dock.id);
                }
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  Dock {dock.id} ({dock.type.charAt(0).toUpperCase() + dock.type.slice(1)})
                </div>
                <Badge
                  className={`
                    ${dock.status === 'occupied'
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-white'
                    }
                  `}
                >
                  {dock.status === 'occupied' ? 'Occupied' : 'Available'}
                </Badge>
                {dock.currentTruck && (
                  <div className="mt-2 text-sm text-gray-600 bg-white/70 px-2 py-1 rounded-lg">
                    <p className="text-sm text-gray-600">Truck: {dock.currentTruck}</p>
                    <p className="text-sm text-gray-500">Assigned: {dock.assignedTime ? new Date(dock.assignedTime).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DockStatusGrid;