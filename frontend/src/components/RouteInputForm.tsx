// components/RouteOptimizer/RouteInputForm.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface RouteInputFormProps {
  source: string;
  setSource: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  selectedMode: 'truck' | 'rail' | 'air';
  setSelectedMode: (value: 'truck' | 'rail' | 'air') => void;
  optimizeRoute: () => void;
  loading: boolean;
}

const RouteInputForm = ({
  source, setSource,
  destination, setDestination,
  weight, setWeight,
  selectedMode, setSelectedMode,
  optimizeRoute,
  loading,
}: RouteInputFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input placeholder="Enter Source Location" value={source} onChange={(e) => setSource(e.target.value)} />
      <Input placeholder="Enter Destination Location" value={destination} onChange={(e) => setDestination(e.target.value)} />
      <Input placeholder="Enter Weight (in kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <Select onValueChange={(value: 'truck' | 'rail' | 'air') => setSelectedMode(value)} value={selectedMode}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Travel Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="truck">Truck</SelectItem>
          <SelectItem value="rail">Rail</SelectItem>
          <SelectItem value="air">Air</SelectItem>
        </SelectContent>
      </Select>



      <Button className="col-span-2 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75" onClick={optimizeRoute} disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : ""} {loading ? "Optimizing..." : "Optimize Route"}
      </Button>
    </div>
  );
};

export default RouteInputForm;
