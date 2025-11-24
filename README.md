# SecretCommitment 🔐

> **Privacy-Preserving Lending Commitment Platform** - Secure USDT lending agreements with encrypted amounts on blockchain

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Sepolia](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io)
[![Built with FHEVM](https://img.shields.io/badge/Built%20with-FHEVM-purple)](https://docs.zama.ai/fhevm)
[![Demo](https://img.shields.io/badge/Demo-Live-green)](http://localhost:3000)

[🚀 Live Demo](#) | [📖 Documentation](./PRD.md) | [💻 GitHub](https://github.com/)

</div>

---

## 🎯 Problem & Solution

### The Pain Point

When conducting USDT lending between individuals (P2P lending, friends, family), users face a critical dilemma:

**Privacy vs. Accountability**

Traditional blockchain lending suffers from two conflicting issues:

1. **📊 Public Transparency = Zero Privacy**
   - All transaction amounts are visible on-chain
   - Anyone can see how much you lend or borrow
   - Embarrassing for personal finance matters
   - Risk of being targeted by bad actors

2. **🔒 Off-Chain Agreements = No Legal Evidence**
   - Private messages/contracts lack blockchain proof
   - Difficult to enforce in disputes
   - No immutable timestamp
   - Easy to deny or modify agreements

### Our Solution: Encrypted Commitments with Blockchain Proof

SecretCommitment uses **FHEVM (Fully Homomorphic Encryption VM)** to enable:

✅ **Encrypted Amounts** - Your lending amount is encrypted on-chain, visible only to you  
✅ **Blockchain Proof** - Immutable record with timestamp for legal evidence  
✅ **Self-Custody** - Only you can decrypt your commitment  
✅ **Zero Trust** - Not even the contract owner can see your amount

**The Best of Both Worlds**: Privacy + Accountability

---

## 🌍 Target Users & Use Cases

### Who Needs This?

1. **🤝 P2P Lenders (Primary)**
   - Individuals lending USDT to friends/family
   - Want to keep amounts private while having proof
   - Need legal evidence for tax reporting or disputes
   - **Example**: "I lent $5,000 to my friend on Jan 1st, but only we need to know the amount"

2. **🏦 Informal Lending Circles**
   - Community-based lending groups (e.g., ROSCA)
   - Need privacy among members but transparency for organizers
   - **Example**: "15 friends in a lending circle, each commit different amounts privately"

3. **💼 Business Loans (SMEs)**
   - Small businesses seeking confidential credit lines
   - Suppliers offering trade credit with privacy
   - **Example**: "A supplier provides $50K credit, but competitors shouldn't know"

4. **🌐 Cross-Border Remittances**
   - Families sending money across borders
   - Want to prove transfer for compliance without exposing amounts
   - **Example**: "Prove I sent money to my parents in another country for visa applications"

5. **📱 DeFi Users with Privacy Concerns**
   - Crypto whales who don't want to expose portfolio sizes
   - Users concerned about being tracked/targeted
   - **Example**: "I want to participate in DeFi lending without broadcasting my wealth"

### Real-World Scenarios

**Scenario 1: Friend-to-Friend Loan**
```
Alice wants to lend $10,000 USDT to Bob for his business.
- Problem: If recorded on-chain, their mutual friends will see the amount
- Solution: Alice submits encrypted commitment, Bob gets legal proof, amount stays private
```

**Scenario 2: Lending Pool Privacy**
```
20 investors contribute to a lending pool.
- Problem: Don't want others to know individual contributions
- Solution: Each submits encrypted commitment, total pool is calculated using FHE
```

**Scenario 3: Tax Reporting**
```
Charlie needs to prove he made a $50K loan for tax deductions.
- Problem: Traditional receipts can be forged
- Solution: Blockchain proof with encrypted amount, decryptable only by Charlie and tax authority (with key)
```

---

## 💡 Business Value Proposition

### For Lenders
- **Privacy Protection**: Keep loan amounts confidential
- **Legal Evidence**: Immutable blockchain timestamp for disputes
- **Risk Management**: Prove creditworthiness without exposing wealth
- **Tax Compliance**: Easy reporting with verifiable records

### For Borrowers
- **Reputation Building**: Build credit history without public exposure
- **Privacy Dignity**: Borrow without social stigma
- **Dispute Resolution**: Clear commitment records prevent misunderstandings
- **Access to Capital**: More willing lenders when privacy is guaranteed

### For the Ecosystem
- **DeFi Adoption**: Lower barrier for privacy-conscious users
- **Financial Inclusion**: Enable lending in communities where privacy is cultural
- **Compliance Ready**: Compatible with KYC/AML (selective disclosure)
- **Innovation**: First step toward fully private DeFi lending protocols

---

## 🚀 Key Features

### 1. **Submit Private Commitment**
- 🔐 Enter your lending/borrowing amount
- ⚡ Automatically encrypted using FHEVM
- 📝 Stored on Ethereum blockchain (Sepolia Testnet)
- ✅ Get confirmation with transaction hash

### 2. **Decrypt Your Commitment**
- 🔓 Only you can decrypt your amount
- 🛡️ Requires EIP-712 signature (wallet authorization)
- 📊 View amount, timestamp, and on-chain status
- 💾 Export as legal evidence

### 3. **Blockchain Verification**
- 🔗 View transaction on Etherscan
- ⏰ Immutable timestamp for legal proof
- 🌐 Decentralized and censorship-resistant
- 🔒 Smart contract verified and open-source

---

## 🏗️ Technical Architecture

### Technology Stack

```
Frontend:
  ├── Next.js 15 (React 19)
  ├── TypeScript
  ├── Tailwind CSS
  ├── RainbowKit + Wagmi (Wallet Connection)
  └── FHEVM Relayer SDK v0.3.0-5

Backend (Smart Contracts):
  ├── Solidity 0.8.24
  ├── Zama FHEVM v0.9
  ├── Hardhat (Development)
  └── Ethers.js v6

Network:
  ├── Ethereum Sepolia Testnet
  └── FHEVM Gateway + KMS

Deployment:
  ├── Vercel (Frontend - Planned)
  └── Sepolia (Smart Contract)
```

### How It Works (Technical Flow)

```
1. User Input
   ↓
2. Client-Side Encryption (FHEVM SDK)
   ├── Amount converted to euint32
   ├── Generate encrypted input + proof
   └── Uses user's wallet address as key
   ↓
3. Smart Contract Submission
   ├── submitCommitment(encryptedAmount, proof)
   ├── FHE.allowThis() - Contract can access handle
   ├── FHE.allow(amount, msg.sender) - User can decrypt
   └── Store encrypted data on-chain
   ↓
4. Decryption (When User Requests)
   ├── Generate temporary keypair
   ├── Create EIP-712 signature message
   ├── User signs with wallet (authorization)
   ├── Call fhevmInstance.userDecrypt()
   └── Display decrypted amount (client-side only)
```

### Security Model

**FHE Permission System**:
```solidity
function submitCommitment(bytes32 encryptedAmount, bytes proof) {
    euint32 amount = FHE.fromExternal(encryptedAmount, proof);
    
    // Critical: Both permissions required
    FHE.allowThis(amount);        // Contract can return handle
    FHE.allow(amount, msg.sender); // User can decrypt handle
    
    userCommitments[msg.sender] = amount;
}
```

**Why This Works**:
- `FHE.allowThis()` → Contract can access encrypted data
- `FHE.allow()` → User authorized to decrypt
- Without both → "not authorized to decrypt" error

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/SecretCommitment.git
cd SecretCommitment

# Install dependencies
pnpm install

# Set up environment
cd packages/nextjs-showcase
cp .env.example .env.local
# Edit .env.local with contract address

# Start development server
pnpm dev
```

Visit http://localhost:3000

### Deployed Contract

**LoanCommitment Contract**:
- Address: `0x3a0592b3f7F4CdA063901e95d426a3335b14f61f`
- Network: Sepolia Testnet
- Explorer: [View on Etherscan](https://sepolia.etherscan.io/address/0x3a0592b3f7F4CdA063901e95d426a3335b14f61f)

---

## 📖 Usage Guide

### Step 1: Connect Wallet
1. Click "Connect Wallet" button
2. Select MetaMask
3. Switch to Sepolia Testnet
4. Approve connection

### Step 2: Submit Commitment
1. Enter amount (e.g., 1000 USDT)
2. Click "Submit Commitment"
3. Sign transaction in MetaMask
4. Wait for confirmation (~15 seconds)

### Step 3: Decrypt & View
1. After submission, click "Decrypt and View Amount"
2. Sign EIP-712 message (decryption authorization)
3. View your encrypted amount

**Note**: All amounts are encrypted with 6 decimal precision (e.g., 1000 = 1000.00 USDT)

---

## 🔧 Development

### Project Structure

```
SecretCommitment/
├── packages/
│   ├── nextjs-showcase/          # Frontend DApp
│   │   ├── app/
│   │   │   ├── dapp/page.tsx     # Main DApp interface
│   │   │   └── layout.tsx        # Root layout + CDN scripts
│   │   ├── components/
│   │   │   ├── CommitmentForm.tsx   # Submit form
│   │   │   ├── MyCommitment.tsx     # Decrypt view
│   │   │   └── Providers.tsx        # RainbowKit config
│   │   └── .env.local            # Environment variables
│   │
│   └── hardhat/                  # Smart Contracts
│       ├── contracts/
│       │   └── LoanCommitment.sol   # Main contract
│       ├── deploy/
│       │   └── deploy_loan_commitment.ts
│       └── test/
│           └── LoanCommitment.test.ts
│
├── WINNING_FORMULA.md           # FHEVM v0.9 migration guide
├── PRD.md                       # Product Requirements
└── README.md                    # This file
```

### Deploy Your Own Contract

```bash
cd packages/hardhat

# Set up environment
npx hardhat vars set MNEMONIC "your 12-word seed phrase"
npx hardhat vars set INFURA_API_KEY "your-infura-key"

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run deploy/deploy_loan_commitment.ts --network sepolia

# Update frontend .env.local with new contract address
```

---

## 🔐 Security Considerations

### Smart Contract Security
- ✅ No owner/admin functions (fully decentralized)
- ✅ No upgrade proxy (immutable logic)
- ✅ Minimal attack surface (< 150 lines)
- ✅ Uses audited FHEVM library from Zama

### Privacy Guarantees
- ✅ Amounts never appear in plaintext on-chain
- ✅ Encrypted data meaningless without decryption keys
- ✅ Only authorized users can decrypt (via EIP-712 signature)
- ✅ Zero-knowledge proofs validate inputs without revealing values

### Known Limitations
- ⚠️ Currently on Sepolia testnet (not production-ready)
- ⚠️ No multi-signature or escrow features (coming in v2)
- ⚠️ FHEVM decryption requires user interaction (not automated)
- ⚠️ Gas costs higher than non-FHE contracts (~200K gas vs ~50K)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Basic commitment submission with encryption
- [x] User-controlled decryption
- [x] Sepolia testnet deployment
- [x] FHEVM v0.9 migration

### Phase 2: Enhanced Features (Q1 2025)
- [ ] Multi-party commitments (group lending pools)
- [ ] Commitment expiry/cancellation
- [ ] Selective disclosure (share with specific addresses)
- [ ] Integration with actual USDT transfers

### Phase 3: Production Ready (Q2 2025)
- [ ] Mainnet deployment
- [ ] Audit by third-party security firm
- [ ] Gas optimization
- [ ] Mobile-friendly UI

### Phase 4: DeFi Integration (Q3 2025)
- [ ] Lending pool smart contracts
- [ ] Interest rate calculations (on encrypted amounts!)
- [ ] Collateral management
- [ ] Integration with major DeFi protocols

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Areas We Need Help**:
- 🧪 Test coverage improvements
- 📱 Mobile UI optimization
- 🌐 Multi-language support
- 📊 Analytics dashboard

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** for FHEVM protocol and developer support
- **Ethereum Foundation** for Sepolia testnet
- **RainbowKit** for wallet connection UX
- **Vercel** for hosting infrastructure (planned)

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/SecretCommitment/issues)
- **Twitter**: [@YourTwitter](https://twitter.com/)
- **Email**: your-email@example.com

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

[⬆ Back to Top](#secretcommitment-)

</div>
