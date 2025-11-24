'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import ContractDisplay from '@/components/ContractDisplay';
import CommitmentForm from '@/components/CommitmentForm';
import MyCommitment from '@/components/MyCommitment';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function DAppPage() {
  const { isConnected, address } = useAccount();
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCommitted, setHasCommitted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const isInitializingRef = useRef(false);

  // Initialize FHEVM
  useEffect(() => {
    if (!isConnected || !address || fhevmInstance || isInitializingRef.current) return;

    const initFhevm = async () => {
      isInitializingRef.current = true;
      setIsInitializing(true);
      setError(null);

      try {
        console.log('🔄 Starting FHEVM initialization...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!window.ethereum) {
          throw new Error('No wallet detected, please install MetaMask');
        }
        
        console.log('🔄 Checking relayerSDK...');
        
        if (!(window as any).relayerSDK) {
          throw new Error('Relayer SDK not loaded. Please refresh the page.');
        }

        console.log('🔄 Initializing SDK...');
        
        await (window as any).relayerSDK.initSDK();

        console.log('🔄 Creating FHEVM instance...');
        
        // FHEVM v0.9 Sepolia configuration
        const config = {
          chainId: 11155111,
          network: window.ethereum,
          aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
          kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
          inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
          verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
          verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
          gatewayChainId: 10901,
          relayerUrl: 'https://relayer.testnet.zama.org',
        };

        const instance = await (window as any).relayerSDK.createInstance(config);

        setFhevmInstance(instance);
        console.log('✅ FHEVM initialized successfully');
      } catch (e: any) {
        setError(e.message);
        console.error('❌ FHEVM init failed:', e);
        isInitializingRef.current = false;
      } finally {
        setIsInitializing(false);
      }
    };

    initFhevm();
  }, [isConnected, address]);

  // Check if user has submitted commitment
  useEffect(() => {
    if (!isConnected || !address || !window.ethereum) return;

    const checkCommitmentStatus = async () => {
      setIsCheckingStatus(true);
      try {
        if (!window.ethereum) {
          throw new Error('No Ethereum provider found');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          ['function hasUserCommitted(address) view returns (bool)'],
          signer
        );

        const committed = await contract.hasUserCommitted(address);
        setHasCommitted(committed);
      } catch (e) {
        console.error('Failed to check commitment status:', e);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkCommitmentStatus();
  }, [isConnected, address]);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Connect Wallet to Start
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Connect your Web3 wallet to use this application
            </p>
            
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Note</strong>: Please switch to <strong>Sepolia Testnet</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initializing state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing FHEVM...
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait, this may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-red-200 dark:border-red-800">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Initialization Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Refresh and Retry
            </button>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Common Issues</strong>: Try using incognito mode or clearing browser cache
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SecretCommitment
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Privacy-Preserving Lending Commitment Platform · Powered by FHEVM
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {hasCommitted && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Commitment Submitted
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Contract Info */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Contract Information</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Network:</span> Sepolia Testnet
                </p>
                <p className="text-gray-600 dark:text-gray-300 break-all">
                  <span className="font-semibold">Address:</span> {CONTRACT_ADDRESS}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form or Commitment View */}
          <div>
            {isCheckingStatus ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Checking commitment status...</p>
                </div>
              </div>
            ) : hasCommitted ? (
              <MyCommitment
                fhevmInstance={fhevmInstance}
                contractAddress={CONTRACT_ADDRESS}
                userAddress={address!}
              />
            ) : (
              <CommitmentForm
                fhevmInstance={fhevmInstance}
                contractAddress={CONTRACT_ADDRESS}
                onSuccess={() => setHasCommitted(true)}
              />
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                ⚠️ Important Notice
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 leading-relaxed">
                <li>• This project is for demonstrating FHEVM technology on Sepolia Testnet</li>
                <li>• Do not use in production or store real assets</li>
                <li>• Commitments are permanently recorded on the blockchain</li>
                <li>• If experiencing wallet conflicts, try using incognito mode</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
