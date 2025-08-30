// components/RouteOptimizer/MapDisplay.tsx
const MapDisplay = ({ mapRef }: any) => {
  return (
    <div className="w-full h-96 rounded border" id="map" ref={mapRef}></div>
  );
};

export default MapDisplay;
