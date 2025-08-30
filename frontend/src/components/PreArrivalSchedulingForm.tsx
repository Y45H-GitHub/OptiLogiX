import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PreArrivalSchedulingFormProps {
  onAppointmentBooked: () => void;
}

const PreArrivalSchedulingForm: React.FC<PreArrivalSchedulingFormProps> = ({ onAppointmentBooked }): JSX.Element => {
  const [newTruckId, setNewTruckId] = useState<string>('');
  const [newSupplier, setNewSupplier] = useState<string>('');
  const [newRequestedTime, setNewRequestedTime] = useState<string>('');
  const [newAppointmentType, setNewAppointmentType] = useState<'loading' | 'unloading'>('loading');

  const handleBookAppointment = async () => {
    try {
      await axios.post('http://localhost:3001/api/appointments/book', {
        truckId: newTruckId,
        supplier: newSupplier,
        requestedTime: newRequestedTime,
        type: newAppointmentType,
      });

      toast.success('Appointment booked successfully!');
      setNewTruckId('');
      setNewSupplier('');
      setNewRequestedTime('');
      setNewAppointmentType('loading');
      onAppointmentBooked(); // Notify parent component to refresh data
    } catch (error: Error | unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(`Error booking appointment: ${error.response?.data?.message || error.message}`);
      } else {
        toast.error('Error booking appointment');
      }
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Book New Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Truck ID (e.g., TRUCK001)"
            className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newTruckId}
            onChange={(e) => setNewTruckId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Supplier Name (e.g., Potato Chips Inc.)"
            className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newSupplier}
            onChange={(e) => setNewSupplier(e.target.value)}
          />
          <input
            aria-label="Requested Appointment Time"
            title="Select your preferred appointment date and time"
            placeholder="Select Date and Time"
            type="datetime-local"
            className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newRequestedTime}
            onChange={(e) => setNewRequestedTime(e.target.value)}
          />
          <select
            aria-label="Appointment Type"
            title="Select whether this is a loading or unloading appointment"
            className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newAppointmentType}
            onChange={(e) => setNewAppointmentType(e.target.value as 'loading' | 'unloading')}
          >
            <option value="loading">Loading</option>
            <option value="unloading">Unloading</option>
          </select>
        </div>
        <Button
          onClick={handleBookAppointment}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreArrivalSchedulingForm;
