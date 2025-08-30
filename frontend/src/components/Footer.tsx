import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, ShieldCheck, TrendingUp, DollarSign, Activity, LineChart, Users,
} from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = [
    {
      name: 'Inventory Spotter',
      icon: Package,
      path: '/inventory-spotter',
      description: 'Real-time inventory tracking and optimization.',
    },
    {
      name: 'Compliance Checker',
      icon: ShieldCheck,
      path: '/compliance-checker',
      description: 'Automated compliance checks for logistics regulations.',
    },
    {
      name: 'Driver View',
      icon: Truck,
      path: '/driver-view',
      description: 'Dashboard for drivers with route information and tasks.',
    },
    {
      name: 'Freight Quotes',
      icon: DollarSign,
      path: '/freight-quotes',
      description: 'Compare and get quotes from various freight carriers.',
    },
    {
      name: 'Risk Dashboard',
      icon: Activity,
      path: '/risk-dashboard',
      description: 'Monitor and mitigate supply chain risks.',
    },
    {
      name: 'Demand Forecasting',
      icon: LineChart,
      path: '/demand-forecasting',
      description: 'Predict future demand to optimize inventory and logistics.',
    },
    {
      name: 'Team Collaboration',
      icon: Users,
      path: '/team-collaboration',
      description: 'Tools for seamless communication and collaboration among teams.',
    },
    {
      name: 'Blockchain Provenance',
      icon: TrendingUp,
      path: '/blockchain-provenance',
      description: 'Traceability and transparency for supply chain assets.',
    },
  ];

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerLinks.map((section, index) => (
            <div key={index} className="mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <section.icon className="w-5 h-5 mr-2" />
                {section.name}
              </h4>
              <p className="text-gray-400 text-sm mb-2">{section.description}</p>
              <Link
                to={section.path}
                className="text-blue-400 hover:underline text-sm"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} OptiLogix. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;