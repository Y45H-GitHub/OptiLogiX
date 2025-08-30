import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import InventorySpotter from '../components/InventorySpotter';
import AskSupplyBot from '../components/AskSupplyBot';
import Footer from '../components/Footer';
import { User, Wallet } from 'lucide-react';
import SimpleModal from '../components/SimpleModal';

const InventorySpotterPage: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="absolute top-10 left-10 flex space-x-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Go back to Home
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Go to Dashboard
        </button>
      </div>
      <div className="absolute top-10 right-10 flex items-center space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
          {user && user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
          ) : (
            <User className="w-6 h-6 text-gray-600" />
          )}

        </div>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsWalletModalOpen(true)}>
          <Wallet className="w-6 h-6 text-gray-600" />
          <span className="text-gray-800 font-medium">Wallet</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Inventory Spotter</h1>
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
          <InventorySpotter />
        </div>
      </div>
      <AskSupplyBot />
      <Footer />

      <SimpleModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="User Profile"
      >
        {user ? (
          <div className="text-center">
            {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" />}
            <p className="text-lg font-semibold">Name: {user.displayName || 'N/A'}</p>
            <p className="text-lg font-semibold">Email: {user.email || 'N/A'}</p>
            <p className="text-gray-600 mt-2">This is your user profile information.</p>
            <p className="text-gray-600">You can add more details here.</p>
          </div>
        ) : (
          <p>Please sign in to view your profile information.</p>
        )}
      </SimpleModal>

      <SimpleModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title="Blockchain Wallet"
      >
        <p>This is your blockchain wallet information.</p>
        <p>You can manage your assets here.</p>
      </SimpleModal>
    </div>
  );
};

export default InventorySpotterPage;