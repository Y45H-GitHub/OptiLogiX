import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import SurplusRescueNetworkDashboard from '../components/SurplusRescueNetworkDashboard';
import AskSupplyBot from '../components/AskSupplyBot';
import Footer from '../components/Footer';
import { User, Wallet } from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, formatEther, Eip1193Provider } from 'ethers';
import { BigNumberish } from 'ethers';

declare global {
    interface Window {
        ethereum?: Eip1193Provider & {
            isMetaMask?: boolean;
            on: (event: string, callback: (...args: any[]) => void) => void;
        };
    }
}

const SurplusRescueNetworkPage: React.FC = () => {
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
            <div className="absolute top-6 left-6 flex space-x-4 z-10">
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

            <div className="absolute top-6 right-6 flex items-center space-x-4 z-10">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                    {user && user.photoURL && user.photoURL !== '' ? (
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                                console.error('Error loading profile picture:', e.currentTarget.src);
                                e.currentTarget.src = '/placeholder.svg';
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
                        <img src="/metamask-connected.png" alt="Wallet Connected" className="w-6 h-6" />
                    ) : (
                        <img src="/metamask-disconnected.jpeg" alt="Wallet Disconnected" className="w-6 h-6" />
                    )}
                    <span className="text-gray-800 font-medium">Wallet</span>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-28 pb-20 sm:px-6 lg:px-8 flex-grow">
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Surplus Rescue Network</h2>
                    <p className="text-lg text-gray-600">Transform surplus inventory into supply chain opportunities</p>
                </div>

                <SurplusRescueNetworkDashboard />
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

export default SurplusRescueNetworkPage;