'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { decryptValue, createEncryptedInput, publicDecrypt } from '@fhevm-sdk';
import { FhevmProvider, useFhevm } from './providers/FhevmProvider';

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e', // Sepolia
}

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getCount",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "decrement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Hardcoded ciphertexts for public decryption testing
const HARDCODED_CIPHERTEXTS = {
  encryptedCount: "0x42bbe4377f93c8e01c6ea6a9bfe98cab65b67b97e1ff0000000000aa36a70500",
  encryptedSum: "0x1495e50acd5cef684c3a9cae49e18a13d631768f70ff0000000000aa36a70500"
};

// Window interface is already declared in types/ethereum.d.ts

function HomePage() {
  const { fheInstance, isInitialized, error, initialize } = useFhevm();
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [countHandle, setCountHandle] = useState<string>('');
  const [decryptedCount, setDecryptedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Public decryption state
  const [publicDecryptedCount, setPublicDecryptedCount] = useState<number | null>(null);
  const [publicDecryptedSum, setPublicDecryptedSum] = useState<number | null>(null);
  const [isPublicDecrypting, setIsPublicDecrypting] = useState(false);

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Initialize FHEVM when wallet connects
  useEffect(() => {
    if (isConnected && !isInitialized && !error) {
      initialize().catch(console.error);
    }
  }, [isConnected, isInitialized, error, initialize]);

  // Wallet connection
  const connectWallet = async () => {
    console.log('🔗 Attempting to connect wallet...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined - not in browser environment');
      return;
    }
    
    if (!window.ethereum) {
      console.error('❌ No Ethereum provider found. Please install MetaMask or connect a wallet.');
      alert('Please install MetaMask or connect a wallet to use this app.');
      return;
    }
    
    try {
      console.log('📱 Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts received:', accounts);
      
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🔗 Chain ID:', chainIdHex);
      
      setAccount(accounts[0]);
      setChainId(parseInt(chainIdHex, 16));
      setIsConnected(true);
      
      console.log('✅ Wallet connected successfully!');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get encrypted count from contract
  const getCount = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setMessage('Reading contract...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const result = await contract.getCount();
      setCountHandle(result);
      setMessage('Contract read successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Get count failed:', error);
      setMessage('Failed to get count');
    }
  };

  // Decrypt count
  const handleDecrypt = async () => {
    if (!countHandle || !fheInstance || !window.ethereum) return;
    
    try {
      setMessage('Decrypting with EIP-712 user decryption...');
      
      // Get signer for EIP-712 signature
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await decryptValue(countHandle, contractAddress, signer);
      setDecryptedCount(result);
      setMessage('EIP-712 decryption completed!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decryption failed:', error);
      setMessage('Decryption failed');
    }
  };

  // Increment counter
  const incrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum || !fheInstance) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting increment transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Increment completed!');
      console.log('✅ Increment transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Increment failed:', error);
      setMessage('Increment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Decrement counter
  const decrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum || !fheInstance) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting decrement transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Decrement completed!');
      console.log('✅ Decrement transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decrement failed:', error);
      setMessage('Decrement failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Public decryption function
  const handlePublicDecrypt = async () => {
    if (!isInitialized) return;
    
    try {
      setIsPublicDecrypting(true);
      setMessage('Testing public decryption...');
      
      // Test public decryption with hardcoded ciphertexts
      const countResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedCount);
      const sumResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedSum);
      
      setPublicDecryptedCount(countResult);
      setPublicDecryptedSum(sumResult);
      setMessage('Public decryption completed!');
      
      console.log('✅ Public decryption results:');
      console.log('Count:', countResult);
      console.log('Sum:', sumResult);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Public decryption failed:', error);
      setMessage('Public decryption failed');
    } finally {
      setIsPublicDecrypting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zama-black text-white font-system">
      {/* FHEVM Header */}
      <header className="bg-zama-yellow py-6 border-b border-zama-black z-50">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h1 className="text-zama-black text-2xl font-bold m-0">Universal FHEVM SDK - Next.js Showcase</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-zama-black min-h-[calc(100vh-120px)] py-8">
        <div className="max-w-6xl mx-auto px-8">
          
          {/* FHEVM Status */}
          <div className="zama-section">
            <div className="zama-section-header">
              <h2 className="zama-title">FHEVM Status</h2>
              <span className={`zama-status-badge ${isInitialized ? 'zama-status-ready' : error ? 'zama-status-error' : 'zama-status-loading'}`}>
                {isInitialized ? 'READY' : error ? 'ERROR' : 'LOADING'}
              </span>
            </div>
            <div className="zama-section-content">
              {error && <p className="zama-error">Error: {error}</p>}
              {isInitialized && <p className="zama-success">FHEVM Ready</p>}
            </div>
          </div>

          {/* Wallet Connection and SDK Info Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Wallet Connection */}
            <div className="zama-section">
              <div className="zama-section-header">
                <h2 className="zama-title">Wallet Connection</h2>
                {!isConnected ? (
                  <button onClick={connectWallet} className="zama-btn zama-btn-warning">
                    Connect Wallet
                  </button>
                ) : (
                  <button onClick={() => {
                    setAccount('');
                    setChainId(0);
                    setIsConnected(false);
                    setCountHandle('');
                    setDecryptedCount(null);
                    setMessage('');
                  }} className="zama-btn zama-btn-danger">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Disconnect
                  </button>
                )}
              </div>
              <div className="p-4">
                {!isConnected ? (
                  <div className="text-center py-4">
                    <p className="text-zama-gray-100">Connect your wallet to use FHEVM features</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <div className="zama-info-item">
                      <span className="zama-label">Status:</span>
                      <span className="zama-success">Connected</span>
                    </div>
                    <div className="zama-info-item">
                      <span className="zama-label">Address:</span>
                      <span className="zama-address">{account}</span>
                    </div>
                    <div className="zama-info-item">
                      <span className="zama-label">Chain ID:</span>
                      <span className="zama-value">{chainId}</span>
                    </div>
                    <div className="zama-info-item">
                      <span className="zama-label">Contract:</span>
                      <span className="zama-address">{contractAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SDK Info */}
            <div className="zama-section">
              <div className="zama-section-header">
                <h2 className="zama-title">Universal FHEVM SDK</h2>
                <p className="zama-subtitle">Next.js compatible implementation</p>
              </div>
              <div className="p-4">
                <div className="grid gap-2 mb-4">
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">Next.js compatible FHEVM</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">No webpack bundling issues</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">Real contract interactions</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">Framework-agnostic core</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">Works in Next.js, React, Vue</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-zama-black rounded-lg border border-zama-gray-400">
                    <span className="text-zama-green font-bold text-lg">✓</span>
                    <span className="text-zama-gray-100 text-sm">Clean, simple API</span>
                  </div>
                </div>
                <div className="text-zama-gray-200 text-xs p-3 bg-zama-black rounded-lg border border-zama-gray-400">
                  <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
                  The SDK provides actual encryption/decryption functionality on Sepolia testnet.
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* FHEVM Counter Demo */}
            {isConnected && isInitialized && (
              <div className="zama-section">
                <div className="zama-section-header">
                  <h2 className="zama-title">FHEVM Counter Demo</h2>
                  <p className="zama-subtitle">Using REAL FHEVM SDK on Sepolia testnet</p>
                </div>
                <div className="zama-section-content">
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <button onClick={getCount} className="zama-btn zama-btn-primary">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                        Get Count
                      </button>
                      {countHandle && (
                        <div className="p-4 bg-zama-black rounded-lg border border-zama-gray-400 flex flex-col gap-2">
                          <span className="zama-label">Handle:</span>
                          <span className="zama-handle">{countHandle}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={handleDecrypt} 
                        disabled={!countHandle}
                        className="zama-btn zama-btn-success"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Decrypt Count
                      </button>
                      {decryptedCount !== null && (
                        <div className="p-4 bg-zama-black rounded-lg border border-zama-gray-400 flex flex-col gap-2">
                          <span className="zama-label">Decrypted Count:</span>
                          <span className="zama-result">{decryptedCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={incrementCounter} 
                        disabled={isProcessing}
                        className="zama-btn zama-btn-warning"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                          <path d="M12 5v14"/>
                        </svg>
                        Increment
                      </button>
                      <button 
                        onClick={decrementCounter} 
                        disabled={isProcessing}
                        className="zama-btn zama-btn-danger"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                        </svg>
                        Decrement
                      </button>
                    </div>

                    {message && (
                      <div className="zama-message">
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Public Decryption Demo */}
            {isInitialized && (
              <div className="zama-section">
                <div className="zama-section-header">
                  <h2 className="zama-title">Public Decryption Demo</h2>
                  <p className="zama-subtitle">Testing public decryption with hardcoded ciphertexts</p>
                </div>
                <div className="zama-section-content">
                  <div className="flex flex-col gap-8">
                    {/* Show ciphertexts initially */}
                    <div className="flex flex-col gap-4">
                      <div className="p-4 bg-zama-black rounded-lg border border-zama-gray-400 flex flex-col gap-2">
                        <span className="zama-label">Encrypted Count Ciphertext:</span>
                        <span className="zama-handle">{HARDCODED_CIPHERTEXTS.encryptedCount}</span>
                      </div>
                      <div className="p-4 bg-zama-black rounded-lg border border-zama-gray-400 flex flex-col gap-2">
                        <span className="zama-label">Encrypted Sum Ciphertext:</span>
                        <span className="zama-handle">{HARDCODED_CIPHERTEXTS.encryptedSum}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={handlePublicDecrypt}
                        disabled={isPublicDecrypting}
                        className="zama-btn zama-btn-primary"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {isPublicDecrypting ? 'Decrypting...' : 'Test Public Decrypt'}
                      </button>
                    </div>

                    {/* Show decrypted results only after clicking */}
                    {(publicDecryptedCount !== null || publicDecryptedSum !== null) && (
                      <div className="p-4 bg-zama-black rounded-lg border border-zama-gray-400 flex flex-col gap-4">
                        <h3 className="text-zama-yellow text-lg font-semibold mb-2">Public Decryption Results:</h3>
                        {publicDecryptedCount !== null && (
                          <div className="zama-info-item">
                            <span className="zama-label">Decrypted Count:</span>
                            <span className="zama-result">{publicDecryptedCount}</span>
                          </div>
                        )}
                        {publicDecryptedSum !== null && (
                          <div className="zama-info-item">
                            <span className="zama-label">Decrypted Sum:</span>
                            <span className="zama-result">{publicDecryptedSum}</span>
                          </div>
                        )}
                          <div className="text-zama-gray-200 text-sm mt-2">
                            These values were decrypted using public decryption (no user signature required)
                          </div>
                          <div className="text-zama-gray-200 text-xs mt-3 p-3 bg-zama-black rounded-lg border border-zama-gray-400">
                            <strong>Source:</strong> The encrypted count and sum ciphertexts are from the{' '}
                            <a 
                              href="https://sepolia.etherscan.io/address/0xb218c0a83fb718683ddbf97b56e01df3de3bfcf3#code" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-zama-yellow hover:text-yellow-400 underline"
                            >
                              FReviewCardsFHE.sol contract
                            </a>
                            {' '}on Sepolia. These ciphertexts are publicly decryptable, demonstrating the public decryption functionality.
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <FhevmProvider>
      <HomePage />
    </FhevmProvider>
  );
}
