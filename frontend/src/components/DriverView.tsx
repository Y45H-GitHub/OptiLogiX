
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Assignment {
  id: number;
  location: string;
  status: string;
  items: string[];
}

const DriverView = () => {
  const [driverId, setDriverId] = useState('driver1'); // This should ideally come from authentication context
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ttsEnabled, setTtsEnabled] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/driver/assignments/${driverId}`);
        if (response.data && response.data.length > 0) {
          // Assuming the driver gets one active assignment at a time
          const fetchedAssignment = response.data[0]; 
          setAssignment(fetchedAssignment);
          if (ttsEnabled && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(
              `You have a new assignment at ${fetchedAssignment.location}. Status: ${fetchedAssignment.status}.`
            );
            utterance.rate = 0.8;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }
          toast.success(`New assignment received for ${driverId}!`);
        } else {
          setAssignment(null);
          toast.info('No active assignments found.');
        }
      } catch (error) {
        console.error('Error fetching driver assignments:', error);
        toast.error('Failed to fetch driver assignments.');
      }
    };

    fetchAssignment();
    const interval = setInterval(fetchAssignment, 30000); // Poll for new assignments every 30 seconds
    return () => clearInterval(interval);
  }, [driverId, ttsEnabled]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const updateStatus = (newStatus: string) => {
    if (assignment) {
      setAssignment({ ...assignment, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      // In a real app, you would send this status update to the backend
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-blue-500';
      case 'in progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const speakAssignment = () => {
    if (assignment && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Your current assignment is at ${assignment.location}. Status: ${assignment.status}.`
      );
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Driver Info */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Driver Dashboard
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              Driver ID: {driverId}
            </div>
            <div className="text-gray-600 bg-white/70 px-3 py-1 rounded-full inline-block border border-emerald-200">
              {formatTime(currentTime)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Status */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Gate Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignment ? (
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                {assignment.location}
              </div>
              <div className="text-xl text-gray-800 mb-2">
                Location: {assignment.location}
              </div>
              {assignment.items && assignment.items.length > 0 && (
                <div className="text-md text-gray-700">
                  Items: {assignment.items.join(', ')}
                </div>
              )}
              <Badge 
                className={`${getStatusColor(assignment.status)} text-white text-sm`}
              >
                {assignment.status.toUpperCase()}
              </Badge>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2 bg-white/70 px-3 py-1 rounded-full border border-teal-200">
                <Clock className="w-4 h-4" />
                {/* Assigned at {formatTime(assignment.assignedAt)} */}
                {/* The backend assignment object does not currently include an 'assignedAt' field. */}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={speakAssignment}
                  className="flex-1 border-teal-300 hover:bg-teal-50 text-teal-700"
                  disabled={!ttsEnabled}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Repeat
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                <div className="text-sm text-gray-600 mb-2">Update Status:</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus('In Progress')}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    disabled={assignment.status.toLowerCase() === 'in progress' || assignment.status.toLowerCase() === 'completed'}
                  >
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus('Completed')}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    disabled={assignment.status.toLowerCase() === 'completed'}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-gray-800 text-lg mb-2">
                Waiting for Assignment
              </div>
              <div className="text-gray-500 text-sm">
                Please stand by for dock assignment
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              Follow the dock signs to your assigned gate
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
              Update status when you begin loading
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              Mark complete when finished
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverView;
