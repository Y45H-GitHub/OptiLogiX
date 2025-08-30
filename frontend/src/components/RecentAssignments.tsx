import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Assignment {
  id: number;
  truckId: string;
  dockId: number;
  assignedTime: string;
  appointmentId: number;
}

interface RecentAssignmentsProps {
  assignments: Assignment[];
  onUpdateAssignmentStatus: (appointmentId: number, status: 'booked' | 'arrived' | 'loading/unloading' | 'completed' | 'departed') => Promise<void>;
  onTruckDepart: (truckId: string) => Promise<void>;
}

const RecentAssignments: React.FC<RecentAssignmentsProps> = ({ assignments, onUpdateAssignmentStatus, onTruckDepart }) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-indigo-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Recent Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {assignment.truckId} → Dock {assignment.dockId}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(assignment.assignedTime)}
                  </div>
                </div>
                <Badge className="bg-indigo-500 text-white">
                  ASSIGNED
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAssignments;