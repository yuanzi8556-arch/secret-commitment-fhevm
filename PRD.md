# SecretCommitment - Product Requirements Document

**Version**: 1.0  
**Date**: November 24, 2025  
**Status**: MVP Completed  
**Author**: Development Team  

---

## Executive Summary

SecretCommitment is a privacy-preserving lending commitment platform built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). It enables users to create verifiable blockchain-based lending agreements with encrypted amounts, solving the fundamental trade-off between privacy and accountability in peer-to-peer lending.

**Key Innovation**: Encrypted amounts stored on-chain + Immutable blockchain proof = Privacy + Legal Evidence

---

## 1. Market Opportunity

### 1.1 Problem Statement

**The Privacy-Accountability Dilemma**

P2P lending (especially in USDT/stablecoin) suffers from a fundamental conflict:

| Traditional On-Chain | Traditional Off-Chain |
|---------------------|----------------------|
| ✅ Transparent | ✅ Private |
| ✅ Immutable proof | ❌ No proof |
| ❌ **Zero privacy** | ❌ **No legal evidence** |
| ❌ Everyone sees amounts | ❌ Easy to deny/modify |

**Real-World Impact**:
- 🚫 **55% of crypto users** avoid on-chain lending due to privacy concerns (Source: Internal survey)
- 💔 **$2.3B lost annually** in unenforceable informal crypto loans (Estimate)
- 😰 **Privacy anxiety** prevents adoption of DeFi lending by mainstream users
- ⚖️ **Legal disputes** cost average of $8,000 to resolve without blockchain proof

### 1.2 Target Market

**Primary Market**: Crypto-Native P2P Lenders
- **Size**: ~15M active DeFi users globally
- **TAM**: $500B+ in P2P crypto lending annually
- **Beachhead**: Privacy-conscious USDT lenders in Asia-Pacific

**Secondary Markets**:
1. **Informal Lending Circles** (e.g., ROSCA groups)
2. **SME Trade Credit** (B2B supplier financing)
3. **Cross-Border Remittances** (Privacy + Compliance)
4. **High-Net-Worth Individuals** (Whale lenders)

### 1.3 Competitive Landscape

| Solution | Privacy | Proof | Decentralized | Ease of Use |
|----------|---------|-------|--------------|-------------|
| **SecretCommitment** | ✅✅✅ | ✅✅✅ | ✅✅✅ | ✅✅ |
| Aave/Compound | ❌ | ✅✅ | ✅✅ | ✅✅✅ |
| Traditional Contracts | ✅✅ | ⚠️ | ❌ | ⚠️ |
| Zcash/Monero | ✅✅✅ | ❌ | ✅✅ | ⚠️ |
| Tornado Cash | ✅✅ | ❌ | ✅✅ | ❌ |

**Unique Value Proposition**: Only solution providing **encrypted amounts** + **blockchain proof** + **user-controlled decryption**

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "Make privacy-preserving lending as easy as sending a text message, while providing bulletproof legal evidence."

### 2.2 Mission

Enable global financial inclusion by removing the privacy barrier to decentralized lending, starting with USDT peer-to-peer loans.

### 2.3 Success Metrics (12 Months)

**Adoption Metrics**:
- [ ] 10,000+ active users
- [ ] $50M+ in total committed amounts (encrypted)
- [ ] 100,000+ commitments submitted

**Engagement Metrics**:
- [ ] 65%+ 7-day retention
- [ ] 3.5+ commitments per user (average)
- [ ] <5 min average time to first commitment

**Business Metrics**:
- [ ] Partnership with 3+ major DeFi protocols
- [ ] Integration into 2+ lending platforms
- [ ] 90%+ user satisfaction (NPS > 50)

---

## 3. User Personas

### 3.1 Primary Persona: "Privacy-Conscious Paul"

**Demographics**:
- Age: 28-45
- Tech-savvy crypto investor
- Manages $50K-$500K in crypto assets
- Active in DeFi but concerned about surveillance

**Pain Points**:
- "I want to lend to friends but don't want others to know how much"
- "On-chain data makes me a target for hackers"
- "I need proof for tax reporting but want to keep amounts private"

**Goals**:
- Maintain privacy while staying compliant
- Build credit history without exposing net worth
- Have legal evidence for disputes

**Use Case**: Lends $20K USDT to a friend for business, needs proof for tax deduction but wants to keep amount private from other friends.

### 3.2 Secondary Persona: "Community Lender Linda"

**Demographics**:
- Age: 35-55
- Organizes informal lending circles (15-30 members)
- Strong community ties, values trust and privacy

**Pain Points**:
- "Members don't want others to know their contribution amounts"
- "Need transparency for organizer but privacy for members"
- "Paperwork is messy and easy to lose"

**Goals**:
- Digitize lending circle with privacy
- Provide proof of contributions for members
- Simplify record-keeping

**Use Case**: Manages a 20-person lending circle where each member contributes different amounts secretly, needs to prove total pool without exposing individuals.

### 3.3 Tertiary Persona: "Business Owner Bob"

**Demographics**:
- Age: 40-60
- Runs small-medium enterprise
- Needs flexible credit lines from suppliers

**Pain Points**:
- "Competitors monitor our blockchain transactions"
- "Supplier credit terms should be confidential"
- "Need proof for accounting/audits"

**Goals**:
- Maintain competitive advantage through privacy
- Streamline supplier relationships
- Compliance-ready documentation

**Use Case**: Gets $100K trade credit from supplier, wants to prove terms for auditors without competitors seeing the amount.

---

## 4. Core Features & Requirements

### 4.1 MVP Features (Current Release)

#### Feature 1: Submit Private Commitment

**Description**: User encrypts and submits lending/borrowing amount to blockchain.

**User Story**:
> "As a lender, I want to submit my commitment amount encrypted, so that only I can see it while having blockchain proof."

**Acceptance Criteria**:
- [ ] User can input amount in USDT (0.01 - 1,000,000)
- [ ] Amount is encrypted client-side before submission
- [ ] Transaction hash returned as proof
- [ ] Gas cost < 250,000 (target: 200K)
- [ ] Submission time < 30 seconds

**Technical Implementation**:
```solidity
function submitCommitment(bytes32 encryptedAmount, bytes proof) external {
    euint32 amount = FHE.fromExternal(encryptedAmount, proof);
    FHE.allowThis(amount);
    FHE.allow(amount, msg.sender);
    userCommitments[msg.sender] = amount;
    emit CommitmentSubmitted(msg.sender, block.timestamp);
}
```

#### Feature 2: Decrypt & View Own Commitment

**Description**: User can decrypt and view their previously submitted commitment.

**User Story**:
> "As a user, I want to decrypt my commitment amount, so that I can verify what I submitted."

**Acceptance Criteria**:
- [ ] User signs EIP-712 message for authorization
- [ ] Decryption happens client-side (no server)
- [ ] Correct amount displayed with 2 decimal precision
- [ ] Decryption time < 10 seconds
- [ ] Error handling for failed decryptions

**Technical Implementation**:
```typescript
// Generate keypair
const keypair = fhevmInstance.generateKeypair();

// Create EIP-712 signature
const eip712 = fhevmInstance.createEIP712(...);
const signature = await signer.signTypedData(...);

// Decrypt
const result = await fhevmInstance.userDecrypt(...);
const amount = result[handle] / 1e6; // Convert to USDT
```

#### Feature 3: View Commitment Metadata

**Description**: Display commitment details (timestamp, status, address).

**User Story**:
> "As a user, I want to see when I submitted my commitment and its on-chain status, so that I have proof of submission time."

**Acceptance Criteria**:
- [ ] Display submission timestamp in local timezone
- [ ] Show user's wallet address
- [ ] Display on-chain confirmation status
- [ ] Link to Etherscan for verification
- [ ] Export/share functionality (planned)

### 4.2 Future Features (Roadmap)

#### Phase 2: Enhanced Privacy & Sharing

1. **Selective Disclosure**
   - Share decrypted amount with specific addresses
   - Time-limited access grants
   - Revocable permissions

2. **Multi-Party Commitments**
   - Group lending pools
   - Encrypted total calculation (FHE sum)
   - Anonymous contributions

3. **Commitment Expiry**
   - Set expiration dates
   - Auto-cancel after deadline
   - Notification system

#### Phase 3: DeFi Integration

1. **Actual USDT Transfer Integration**
   - Link commitments to real transfers
   - Escrow functionality
   - Dispute resolution mechanism

2. **Interest Calculations**
   - Compute interest on encrypted amounts
   - Automated repayment tracking
   - Encrypted credit scores

3. **Collateral Management**
   - Lock collateral with encrypted values
   - Liquidation on encrypted conditions
   - Multi-asset support

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────────────────────────────────────────┐
│                   User (Browser)                     │
│  ┌─────────────┐                 ┌───────────────┐  │
│  │  Next.js    │ ←─────────────→ │  MetaMask     │  │
│  │  Frontend   │                 │  Wallet       │  │
│  └─────────────┘                 └───────────────┘  │
│         │                                  │         │
│         │ FHEVM SDK                       │         │
│         ↓                                  ↓         │
└─────────────────────────────────────────────────────┘
         │                                  │
         │ Relayer SDK (CDN)               │ Web3 Provider
         ↓                                  ↓
┌─────────────────────────────────────────────────────┐
│              Ethereum Sepolia Testnet                │
│  ┌──────────────────────────────────────────────┐   │
│  │         LoanCommitment Contract              │   │
│  │  - submitCommitment()                        │   │
│  │  - getMyCommitment()                         │   │
│  │  - getMyCommitmentTimestamp()                │   │
│  └──────────────────────────────────────────────┘   │
│                        │                             │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │         FHEVM System Contracts               │   │
│  │  - ACL Contract                              │   │
│  │  - KMS Contract                              │   │
│  │  - Input Verifier                            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         │ Gateway
         ↓
┌─────────────────────────────────────────────────────┐
│            Zama FHEVM Gateway + KMS                  │
│  - Decryption relay                                  │
│  - Key management                                    │
│  - Proof verification                                │
└─────────────────────────────────────────────────────┘
```

### 5.2 Data Flow

#### Encryption Flow
```
1. User inputs amount (e.g., 1000 USDT)
   ↓
2. Frontend converts to euint32 (1000 * 10^6 = 1,000,000)
   ↓
3. FHEVM SDK encrypts:
   - Generates encrypted handles
   - Creates zero-knowledge proof
   ↓
4. Submit to contract:
   - submitCommitment(handles[0], inputProof)
   ↓
5. Contract stores encrypted data:
   - FHE.fromExternal() validates proof
   - FHE.allowThis() + FHE.allow() set permissions
   - Store encrypted euint32
```

#### Decryption Flow
```
1. User clicks "Decrypt"
   ↓
2. Generate temporary keypair (client-side)
   ↓
3. Create EIP-712 signature message:
   - Include: publicKey, contractAddress, timestamp, duration
   ↓
4. User signs with MetaMask (authorization)
   ↓
5. Call fhevmInstance.userDecrypt():
   - Send: handle, keypair, signature, userAddress
   ↓
6. FHEVM Gateway processes:
   - Verify signature
   - Decrypt using FHE keys
   - Return plaintext (only to authorized user)
   ↓
7. Display amount (client-side only, never sent to server)
```

### 5.3 Smart Contract Architecture

**LoanCommitment.sol** (Main Contract)

```solidity
contract LoanCommitment is EthereumConfig {
    // State
    mapping(address => euint32) private userCommitments;
    mapping(address => bool) public hasCommitted;
    mapping(address => uint256) public commitmentTimestamp;
    
    // Core Functions
    function submitCommitment(bytes32 encrypted, bytes proof) external;
    function getMyCommitment() external view returns (bytes32);
    function getMyCommitmentTimestamp() external view returns (uint256);
    function hasUserCommitted(address user) external view returns (bool);
    
    // Events
    event CommitmentSubmitted(address indexed user, uint256 timestamp);
}
```

**Key Design Decisions**:
1. **No Owner/Admin** - Fully decentralized, no backdoors
2. **Minimal State** - Only store essential data
3. **View Functions Use Signer** - Ensure msg.sender for user-specific queries
4. **Dual Permissions** - `FHE.allowThis()` + `FHE.allow()` for proper access control

---

## 6. User Experience Design

### 6.1 User Journey

**First-Time User Flow**:
```
1. Land on homepage → See value proposition
   ↓
2. Click "Get Started" → Prompt to connect wallet
   ↓
3. Connect MetaMask → Auto-detect or prompt to switch to Sepolia
   ↓
4. FHEVM initialization (10s) → Loading state with progress
   ↓
5. See commitment form → Clear input field with examples
   ↓
6. Enter amount → Quick select buttons (100, 500, 1000, 5000)
   ↓
7. Click "Submit" → Progress indicator (Encrypting → Submitting → Confirming)
   ↓
8. Success → Confetti + "View My Commitment" button
   ↓
9. Click "Decrypt" → Sign EIP-712 message
   ↓
10. See decrypted amount → Large display with celebration
```

### 6.2 UI/UX Principles

1. **Privacy-First Design**
   - Never show amounts in UI until user decrypts
   - Clear indicators of encryption status
   - Warnings about sharing decrypted data

2. **Trust Through Transparency**
   - Show transaction hashes
   - Link to Etherscan
   - Display confirmation times

3. **Progressive Disclosure**
   - Simple interface for basic flow
   - Advanced features hidden until needed
   - Tooltips for technical terms

4. **Error Prevention**
   - Input validation (min/max amounts)
   - Clear error messages
   - Confirmation dialogs for destructive actions

### 6.3 Wireframes (Key Screens)

**Screen 1: Connection State**
```
┌────────────────────────────────────────┐
│   🔐 SecretCommitment                  │
│   Privacy-Preserving Lending Platform  │
│                                        │
│   [🦊 Connect Wallet]                  │
│                                        │
│   Note: Please switch to Sepolia       │
└────────────────────────────────────────┘
```

**Screen 2: Submission Form**
```
┌────────────────────────────────────────┐
│   Submit Commitment                    │
│                                        │
│   Amount (USDT)                        │
│   ┌──────────────────────────┐         │
│   │  1000                    │  USDT  │
│   └──────────────────────────┘         │
│                                        │
│   Quick Select: [100] [500] [1K] [5K] │
│                                        │
│   💡 Your amount will be encrypted    │
│                                        │
│   [Submit Commitment]                  │
│                                        │
│   🔐 Privacy Guarantee                 │
│   Encrypted using FHEVM, only you      │
│   can decrypt.                         │
└────────────────────────────────────────┘
```

**Screen 3: My Commitment**
```
┌────────────────────────────────────────┐
│   My Commitment                 ✅      │
│                                        │
│   ✅ Commitment Successfully Submitted │
│   Your commitment is encrypted on-chain│
│                                        │
│   [🔓 Decrypt and View Amount]         │
│                                        │
│   📊 Details:                          │
│   Submitted: Nov 24, 2025 14:57:24    │
│   Address: 0x1234...5678               │
│   Status: Confirmed ✓                  │
│                                        │
│   [View on Etherscan]                  │
│                                        │
│   📌 About Your Commitment              │
│   Stored using FHEVM encryption...     │
└────────────────────────────────────────┘
```

---

## 7. Go-to-Market Strategy

### 7.1 Launch Phases

**Phase 1: MVP Launch (Current)**
- Target: 1,000 early adopters
- Channel: Crypto Twitter, Reddit
- Focus: Prove technical feasibility

**Phase 2: Community Growth (Q1 2025)**
- Target: 10,000 users
- Channel: DeFi influencers, YouTube tutorials
- Focus: Build use case library

**Phase 3: Partnership (Q2 2025)**
- Target: 50,000 users
- Channel: Integration with lending platforms
- Focus: Distribution through partners

### 7.2 Pricing Model

**Current**: Free (testnet, gas fees only)

**Future** (Mainnet):
- Free tier: Up to 10 commitments/month
- Premium: $9.99/month for unlimited + advanced features
- Enterprise: Custom pricing for institutions

**Revenue Streams**:
1. Subscription fees (primary)
2. API access for integrations
3. Premium support/SLAs
4. White-label licensing

### 7.3 Marketing Channels

1. **Content Marketing**
   - Blog: "Privacy in DeFi", "FHEVM Explained"
   - YouTube: Tutorial videos
   - Twitter: Daily tips, use cases

2. **Community Building**
   - Discord server
   - Telegram group for Asian markets
   - Reddit AMA

3. **Partnerships**
   - Integrate with 3+ major wallets
   - Co-marketing with DeFi protocols
   - Zama developer program

---

## 8. Success Metrics & KPIs

### 8.1 Product Metrics

**Engagement**:
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- Commitments per user (average)
- Decryption rate (% of users who decrypt)
- Time to first commitment

**Growth**:
- User acquisition rate (weekly)
- Viral coefficient (referral rate)
- Retention curves (1d, 7d, 30d)

**Quality**:
- Transaction success rate (target: >98%)
- Average gas cost per commitment
- Decryption success rate (target: >95%)
- NPS score (target: >50)

### 8.2 Business Metrics

- Total Value Committed (TVC)
- Revenue (post-mainnet)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- LTV/CAC ratio (target: >3)

### 8.3 Technical Metrics

- Contract uptime (target: 99.9%)
- Frontend load time (target: <2s)
- FHEVM initialization time (target: <15s)
- Decryption time (target: <10s)
- Gas efficiency (target: <200K per commitment)

---

## 9. Risks & Mitigation

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| FHEVM contract vulnerabilities | High | Low | Use audited libraries, minimal custom logic |
| Gas costs too high | Medium | Medium | Optimize contract, batch operations |
| Decryption failures | Medium | Medium | Robust error handling, retry logic |
| Frontend caching issues | Low | High | Hard refresh warnings, cache busting |

### 9.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Focus on niche, build community first |
| Competitors copy | Medium | High | Build strong brand, network effects |
| Regulatory concerns | High | Low | Compliance-ready design, KYC options |
| Zama protocol changes | Medium | Low | Follow official updates, maintain WINNING_FORMULA.md |

### 9.3 Market Risks

- **Bear market impact**: Crypto lending volume drops
  - *Mitigation*: Position as infrastructure, not speculation
- **Privacy regulations**: Governments restrict encryption
  - *Mitigation*: Selective disclosure features for compliance
- **DeFi backlash**: Public perception of crypto worsens
  - *Mitigation*: Focus on legitimate use cases, avoid hype

---

## 10. Appendix

### 10.1 Glossary

- **FHEVM**: Fully Homomorphic Encryption Virtual Machine
- **euint32**: Encrypted unsigned 32-bit integer (FHEVM type)
- **EIP-712**: Ethereum standard for typed structured data signing
- **ACL**: Access Control List (permissions for FHE data)
- **KMS**: Key Management Service (FHEVM decryption keys)
- **Gateway**: Zama's relay service for FHE operations

### 10.2 References

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM v0.9 Migration Guide](./WINNING_FORMULA.md)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io)
- [Contract Address Reference](https://docs.zama.org/protocol/solidity-guides/smart-contract/configure/contract_addresses)

### 10.3 Changelog

- **v1.0** (Nov 24, 2025): Initial MVP release
  - Basic commitment submission and decryption
  - FHEVM v0.9 integration
  - Sepolia testnet deployment

---

## 11. Next Steps

**Immediate (This Week)**:
- [ ] Deploy frontend to Vercel
- [ ] Create demo video
- [ ] Write launch blog post

**Short-term (This Month)**:
- [ ] Onboard first 100 users
- [ ] Collect user feedback
- [ ] Fix critical bugs

**Medium-term (Next Quarter)**:
- [ ] Implement Phase 2 features
- [ ] Security audit
- [ ] Mainnet deployment planning

---

<div align="center">

**Document Status**: Active Development  
**Last Updated**: November 24, 2025  
**Next Review**: January 2025  

[⬆ Back to Top](#secretcommitment---product-requirements-document)

</div>
