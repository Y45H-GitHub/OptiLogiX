
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AskSupplyBot from '../components/AskSupplyBot';
import DispatcherDashboard from '@/components/DispatcherDashboard';
import RouteOptimizer from '@/components/RouteOptimizer';
import SmartChain360Dashboard from '@/components/SmartChain360Dashboard';
import SurplusRescueNetworkDashboard from '@/components/SurplusRescueNetworkDashboard';
import Footer from '@/components/Footer';

import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Building, Route, Layout, User, Wallet, Package, Recycle } from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import LogisticsPage from './LogisticsPage';
import { Toaster } from 'sonner';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, formatEther, JsonRpcSigner, Eip1193Provider } from 'ethers';
import { BigNumberish } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const Index = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<BigNumberish | null>(null);
  const [hasMetamask, setHasMetamask] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkMetamask = async () => {
      try {
        const provider = await detectEthereumProvider({ silent: true, mustBeMetaMask: false });
        if (provider) {
          setHasMetamask(true);
          // Check if already connected
          try {
            const accounts = await (provider as unknown as Eip1193Provider).request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              const address = accounts[0] as string;
              setWalletAddress(address);
              const ethProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
              const balance = await ethProvider.getBalance(address);
              setBalance(balance.toString());
            }
          } catch (error) {
            console.error('Error checking MetaMask accounts:', error);
          }
        } else {
          setHasMetamask(false);
        }
      } catch (error) {
        console.error('Error detecting Ethereum provider:', error);
        setHasMetamask(false);
      }
    };
    checkMetamask();

    if (window.ethereum) {
      (window.ethereum as any).on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0] as string;
          setWalletAddress(address);
          const ethProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
          const balance = await ethProvider.getBalance(address);
          setBalance(balance.toString());
        } else {
          setWalletAddress(null);
          setBalance(null);
        }
      });
      (window.ethereum as any).on('chainChanged', () => {
        setWalletAddress(null);
        setBalance(null);
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider({ silent: true, mustBeMetaMask: false });
      if (!provider) {
        alert('Metamask is not installed. Please install it to connect your wallet.');
        return;
      }
      try {
        const ethProvider = new BrowserProvider(provider as unknown as Eip1193Provider);
        const accounts = await ethProvider.send('eth_requestAccounts', []) as string[];
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          const balance = await ethProvider.getBalance(address);
          setBalance(balance.toString());
        }
      } catch (innerError) {
        console.error('Failed to request accounts or get balance:', innerError);
        alert('Failed to connect to your wallet. Please try again.');
      }
    } catch (error) {
      console.error('Failed to detect Ethereum provider:', error);
      alert('Failed to detect Metamask. Please make sure it is installed and try again.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    alert('Metamask disconnected.');
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="absolute top-10 right-10 flex items-center space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
          {user && user.photoURL && user.photoURL !== '' ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                console.error('Error loading profile picture:', e.currentTarget.src);
                e.currentTarget.src = '/placeholder.svg'; // Fallback to a generic image if loading fails
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <User className="w-6 h-6 text-gray-600" />
          )}
          <span className="text-gray-800 font-medium">{user ? (user.displayName || user.email) : 'Profile'}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsWalletModalOpen(true)}>
          {walletAddress ? (
            <img src="/metamask-connected.png" alt="Wallet Connected" className="w-6 h-6" /> // Replace with your connected icon
          ) : (
            <img src="/metamask-disconnected.jpeg" alt="Wallet Disconnected" className="w-6 h-6" /> // Replace with your disconnected icon
          )}
          <span className="text-gray-800 font-medium">Wallet</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.png" alt="OptiLogix Logo" className="h-12 w-12 mr-3" />
            <h1
              className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent py-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              OptiLogix
            </h1>
          </div>
        </div>
        <AskSupplyBot />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex w-full max-w-4xl mx-auto mb-8 bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-2xl rounded-2xl p-2 h-auto gap-3">
            <TabsTrigger
              value="dashboard"
              className="flex-1 flex flex-col items-center gap-2 px-3 py-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-500 rounded-xl font-semibold text-sm h-full min-h-[80px]"
            >
              <Layout className="w-6 h-6" />
              <span className="text-center">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="dispatcher"
              className="flex-1 flex flex-col items-center gap-2 px-3 py-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-500 rounded-xl font-semibold text-sm h-full min-h-[80px]"
            >
              <Building className="w-6 h-6" />
              <span className="text-center">Dock Dispatcher</span>
            </TabsTrigger>
            <TabsTrigger
              value="route-optimizer"
              className="flex-1 flex flex-col items-center gap-2 px-3 py-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-500 rounded-xl font-semibold text-sm h-full min-h-[80px]"
            >
              <Route className="w-6 h-6" />
              <span className="text-center">Route Optimizer</span>
            </TabsTrigger>
            <TabsTrigger
              value="surplus-rescue"
              className="flex-1 flex flex-col items-center gap-2 px-3 py-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-500 rounded-xl font-semibold text-sm h-full min-h-[80px]"
            >
              <Recycle className="w-6 h-6" />
              <span className="text-center">Surplus Rescue</span>
            </TabsTrigger>
            <TabsTrigger
              value="logistics"
              className="flex-1 flex flex-col items-center gap-2 px-3 py-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-500 rounded-xl font-semibold text-sm h-full min-h-[80px]"
            >
              <Building className="w-6 h-6" />
              <span className="text-center">Logistics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="focus-visible:outline-none">
            <SmartChain360Dashboard />
          </TabsContent>

          <TabsContent value="dispatcher" className="focus-visible:outline-none">
            <DispatcherDashboard />
          </TabsContent>

          <TabsContent value="route-optimizer" className="focus-visible:outline-none">
            <RouteOptimizer />
          </TabsContent>

          <TabsContent value="surplus-rescue" className="focus-visible:outline-none">
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={() => navigate('/surplus-rescue')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                >
                  Open Full Surplus Rescue Network
                </button>
              </div>
              <SurplusRescueNetworkDashboard />
            </div>
          </TabsContent>

          <TabsContent value="logistics" className="focus-visible:outline-none">
            <LogisticsPage />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
      <Toaster />

      <SimpleModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="User Profile"
      >
        {user ? (
          <div className="text-center">
            {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" referrerPolicy="no-referrer" crossOrigin="anonymous" />}
            <p className="text-lg font-semibold">Name: {user.displayName || 'N/A'}</p>
            <p className="text-lg font-semibold">Email: {user.email || 'N/A'}</p>
            <p className="text-gray-600 mt-2">This is your user profile information.</p>
            <p className="text-gray-600">You can add more details here.</p>
            <button
              onClick={() => {
                signOut(auth).then(() => {
                  console.log('User signed out successfully');
                  setIsProfileModalOpen(false);
                  navigate('/auth');
                }).catch((error) => {
                  console.error('Error signing out:', error);
                  alert('Failed to sign out. Please try again.');
                });
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
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
        <div className="text-center">
          {walletAddress ? (
            <div className="break-words">
              <p className="text-lg font-semibold">Connected Account:</p>
              <p className="text-md text-gray-700">{walletAddress}</p>
              {balance && (
                <p className="text-md text-gray-700 mt-2">Balance: {formatEther(balance)} ETH</p>
              )}
              <button
                onClick={disconnectWallet}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Disconnect Metamask
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Connect Metamask
            </button>
          )}
          {!hasMetamask && (
            <p className="text-red-500 mt-4">Metamask not detected. Please install Metamask to use this feature.</p>
          )}
        </div>
      </SimpleModal>
    </div>
  );
};

export default Index;
