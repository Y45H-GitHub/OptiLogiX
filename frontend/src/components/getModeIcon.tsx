import { Car, Train, Plane, Route } from 'lucide-react';

const getModeIcon = (profile: string) => {
  switch (profile) {
    case 'car': return <Car className="w-5 h-5" />;
    case 'train': return <Train className="w-5 h-5" />;
    case 'plane': return <Plane className="w-5 h-5" />;
    default: return <Route className="w-5 h-5" />;
  }
};

export default getModeIcon;
