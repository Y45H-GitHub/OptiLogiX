import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Truck, MapPin, Clock, ArrowRight } from 'lucide-react';
import PreArrivalSchedulingForm from './PreArrivalSchedulingForm';
import DockStatusGrid from './DockStatusGrid';
import TruckQueueDisplay from './TruckQueueDisplay';
import AssignmentControl from './AssignmentControl';
import RecentAssignments from './RecentAssignments';
import { toast } from 'sonner';

interface Dock {
  id: number;
  status: string; // e.g., 'available', 'occupied'
  currentTruck: string | null;
  assignedTime: string | null;
  type: 'loading' | 'unloading' | 'priority';
}

interface Appointment {
  id: number;
  truckId: string;
  supplier: string;
  dockId: number | null;
  scheduledTime: string;
  status: 'booked' | 'arrived' | 'loading/unloading' | 'completed' | 'departed';
  actualArrivalTime: string | null;
  loadingStartTime: string | null;
  loadingEndTime: string | null;
  departureTime: string | null;
  type: 'loading' | 'unloading';
  assignedTime: string | null; // Added to match Assignment interface
  appointmentId: number; // Added to match Assignment interface
}

interface TruckInQueue {
  truckId: string;
  arrivalTime: string;
  appointmentId: number;
}

const DispatcherDashboard: React.FC = () => {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [truckQueue, setTruckQueue] = useState<TruckInQueue[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Appointment[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedDock, setSelectedDock] = useState<number | null>(null);


  const fetchDashboardData = async () => {
    try {
      const [docksRes, queueRes, appointmentsRes, recentAssignmentsRes] = await Promise.all([

        axios.get<Dock[]>('http://localhost:5000/api/docks'),
        axios.get<TruckInQueue[]>('http://localhost:5000/api/truck-queue'),
        axios.get<Appointment[]>('http://localhost:5000/api/appointments'),
        axios.get<Appointment[]>('http://localhost:5000/api/recent-assignments'),

      ]);
      console.log('Docks data from API:', docksRes.data);
      if (docksRes.data.length === 0) {
        console.warn('No dock data received from API. Check backend and database.');
      }
      setDocks(docksRes.data);
      setTruckQueue(queueRes.data);
      setAppointments(appointmentsRes.data);
      setRecentAssignments(recentAssignmentsRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);



  const handleTruckArrive = async (truckId: string) => {
    try {
      // Fetch the latest appointment for the truckId
      const appointmentRes = await axios.get<Appointment[]>(`http://localhost:5000/api/appointments?truckId=${truckId}`);
      const latestAppointment = appointmentRes.data[0]; // Assuming the first one is the latest

      if (!latestAppointment) {
        toast.error(`No appointment found for truck ${truckId}.`);
        return;
      }

      await axios.post('http://localhost:5000/api/trucks/arrive', { truckId, appointmentId: latestAppointment.id });
      toast.success(`Truck ${truckId} marked as arrived!`);
      fetchDashboardData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Error marking truck arrival: ${error.response?.data?.message || (error instanceof Error ? error.message : 'An unknown error occurred')}`);
      }
    }
  };

  const handleAssignTruckToDock = async () => {
    if (!selectedTruck || !selectedDock) {
      toast.error('Please select both a truck and a dock for assignment.');
      return;
    }
    const truckId = selectedTruck;
    const dockId = selectedDock;

    try {
      // Fetch the latest appointment for the selected truck
      const appointmentRes = await axios.get<Appointment[]>(`http://localhost:5000/api/appointments?truckId=${truckId}`);
      const latestAppointment = appointmentRes.data[0]; // Assuming the first one is the latest

      if (!latestAppointment) {
        toast.error(`No appointment found for truck ${truckId}. Cannot assign to dock.`);
        return;
      }

      await axios.post('http://localhost:5000/api/dispatcher/assign', { truckId, dockId, appointmentId: latestAppointment.id });
      toast.success(`Truck ${truckId} assigned to Dock ${dockId}!`);
      fetchDashboardData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Error assigning truck to dock: ${error.response?.data?.message || (error instanceof Error ? error.message : 'An unknown error occurred')}`);
      }
    }
  };

  const handleUpdateAssignmentStatus = async (appointmentId: number, status: Appointment['status']) => {
    try {
      await axios.post('http://localhost:5000/api/assignments/update-status', { appointmentId, status });
      toast.success(`Assignment ${appointmentId} status updated to ${status}!`);
      fetchDashboardData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Error updating assignment status: ${error.response?.data?.message || (error instanceof Error ? error.message : 'An unknown error occurred')}`);
      }
    }
  };

  const handleTruckDepart = async (truckId: string) => {
    try {
      await axios.post('http://localhost:5000/api/trucks/depart', { truckId });
      toast.success(`Truck ${truckId} departed!`);
      fetchDashboardData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Error marking truck departure: ${error.response?.data?.message || (error instanceof Error ? error.message : 'An unknown error occurred')}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Building className="w-8 h-8 text-emerald-600" />
            Dock Dispatcher Control Center
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Pre-arrival Scheduling */}
      <PreArrivalSchedulingForm onAppointmentBooked={fetchDashboardData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dock Status Grid */}
        <DockStatusGrid
            docks={docks}
            onAssignTruckToDock={handleAssignTruckToDock}
            onSelectDock={setSelectedDock}
            selectedDock={selectedDock}
          />

        {/* Truck Queue */}
        <TruckQueueDisplay truckQueue={truckQueue} selectedTruck={selectedTruck} onSelectTruck={setSelectedTruck} />
      </div>

      {/* Assignment Section */}
      <AssignmentControl
        selectedTruck={selectedTruck}
        selectedDock={selectedDock}
        onAssignTruckToDock={handleAssignTruckToDock}
      />

      {/* Recent Assignments */}
          <RecentAssignments
            assignments={recentAssignments}
            onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
            onTruckDepart={handleTruckDepart}
          />
    </div>
  );
};

export default DispatcherDashboard;
