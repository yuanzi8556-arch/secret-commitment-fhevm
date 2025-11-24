/**
 * Get the wallet provider from window
 * Supports MetaMask (window.ethereum), OKX Wallet (window.okxwallet), and other EIP-1193 providers
 */
export function getWalletProvider(): any {
  if (typeof window === 'undefined') return null;
  
  // Try window.ethereum first (MetaMask, most wallets)
  if ((window as any).ethereum) {
    return (window as any).ethereum;
  }
  
  // Try OKX Wallet
  if ((window as any).okxwallet?.provider) {
    return (window as any).okxwallet.provider;
  }
  
  return null;
}

