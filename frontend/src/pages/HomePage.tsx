import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth'); // Navigate to a new authentication page
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.png" alt="OptiLogix Logo" className="h-12 w-12 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent py-2">
              OptiLogix
            </h1>
          </div>
          <p className="text-xl mb-8 text-center max-w-2xl text-gray-700">
            Your ultimate solution for optimizing logistics and supply chain management.
            Streamline operations, enhance efficiency, and drive growth with our cutting-edge platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-xl border border-emerald-200">
            <h2 className="text-2xl font-semibold mb-3 text-emerald-700">Smart Inventory</h2>
            <p className="text-gray-600">Keep track of your stock with real-time updates and predictive analytics.</p>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-xl border border-teal-200">
            <h2 className="text-2xl font-semibold mb-3 text-teal-700">Route Optimization</h2>
            <p className="text-gray-600">Find the most efficient routes for your deliveries, saving time and fuel.</p>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-xl border border-cyan-200">
            <h2 className="text-2xl font-semibold mb-3 text-cyan-700">Compliance Checker</h2>
            <p className="text-gray-600">Ensure all your parcels meet regulatory standards effortlessly.</p>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-75"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;