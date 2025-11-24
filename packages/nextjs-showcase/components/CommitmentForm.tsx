'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface CommitmentFormProps {
  fhevmInstance: any;
  contractAddress: string;
  onSuccess: () => void;
}

export default function CommitmentForm({
  fhevmInstance,
  contractAddress,
  onSuccess,
}: CommitmentFormProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'encrypting' | 'submitting' | 'confirming'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Encrypt amount
      setCurrentStep('encrypting');
      const amountInWei = Math.floor(parseFloat(amount) * 1e6); // Convert to 6 decimal places

      const input = fhevmInstance.createEncryptedInput(contractAddress, address);
      input.add32(amountInWei);
      const encryptedInput = await input.encrypt();
      
      console.log('✅ Amount encrypted:', encryptedInput);

      // Step 2: Submit to contract
      setCurrentStep('submitting');
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        [
          'function submitCommitment(bytes32 encryptedAmount, bytes calldata proof) external',
        ],
        signer
      );

      const tx = await contract.submitCommitment(
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );
      console.log('✅ Transaction sent:', tx.hash);

      // Step 3: Wait for confirmation
      setCurrentStep('confirming');
      await tx.wait();
      console.log('✅ Transaction confirmed');

      // Success
      onSuccess();
      
    } catch (e: any) {
      console.error('❌ Submission failed:', e);
      setError(e.message || 'Submission failed, please try again');
      setCurrentStep('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Submit Commitment
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Commitment Amount (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount you're willing to lend or borrow"
                step="0.01"
                min="0"
                disabled={isSubmitting}
                className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                USDT
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Your amount will be encrypted and stored on-chain. Only you can view it.
            </p>
          </div>

          {/* Quick Select Amounts */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Select:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['100', '500', '1000', '5000'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value)}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>
                  {currentStep === 'encrypting' && 'Encrypting...'}
                  {currentStep === 'submitting' && 'Submitting...'}
                  {currentStep === 'confirming' && 'Confirming...'}
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Commitment
              </>
            )}
          </button>

          {/* Progress Indicator */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>
                  {currentStep === 'encrypting' && '1/3'}
                  {currentStep === 'submitting' && '2/3'}
                  {currentStep === 'confirming' && '3/3'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width:
                      currentStep === 'encrypting'
                        ? '33%'
                        : currentStep === 'submitting'
                        ? '66%'
                        : '100%',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className={currentStep === 'encrypting' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
                  Encrypt
                </span>
                <span className={currentStep === 'submitting' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
                  Submit
                </span>
                <span className={currentStep === 'confirming' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
                  Confirm
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
              <p className="font-semibold mb-1">🔐 Privacy Guarantee</p>
              <p>When you submit, your amount will be encrypted using FHEVM homomorphic encryption technology. The encrypted data is stored on the blockchain, and only you can decrypt and view it. No one else, including the contract owner, can know your specific amount.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
