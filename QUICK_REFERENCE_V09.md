# FHEVM v0.9 快速参考卡片 🚀

> 一页纸搞定 FHEVM v0.9 开发的所有关键点

---

## 📦 1. Sepolia 系统合约地址（必背！）

```typescript
const SEPOLIA_CONFIG = {
  chainId: 11155111,
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  gatewayChainId: 10901,
  relayerUrl: 'https://relayer.testnet.zama.org',
};
```

---

## 🔐 2. 权限模型（最容易出错！）

```solidity
// ✅ 正确：两个权限都要设置
function submitData(externalEuint32 data, bytes calldata proof) external {
    euint32 encrypted = FHE.fromExternal(data, proof);
    
    FHE.allowThis(encrypted);     // 1️⃣ 合约能访问/返回 handle
    FHE.allow(encrypted, msg.sender); // 2️⃣ 用户能解密 handle
}

function getMyData() external view returns (bytes32) {
    return FHE.toBytes32(userDataVotre[msg.sender]); // ✅ 能返回
}
```

---

## 🎨 3. 合约配置

```solidity
// ✅ v0.9 正确写法
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is EthereumConfig {
    // 你的合约代码
}
```

---

## 🚀 4. 前端加密流程

```typescript
// 1. 创建加密输入
const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
input.add32(value); // 或 add8, add16, add64, add128, add256, addAddress, addBool

// 2. 加密
const encryptedInput = await input.encrypt();

// 3. 提交到合约（注意结构！）
await contract.submitData(
  encryptedInput.handles[0],    // ✅ handles[0]，不是 encryptedData
  encryptedInput.inputProof     // ✅ inputProof，不是 proof
);
```

---

## 🔓 5. 前端解密流程（完整版）

```typescript
// 1. 生成密钥对
const keypair = fhevmInstance.generateKeypair();

// 2. 创建 EIP-712 消息
const eip712 = fhevmInstance.createEIP712(
  keypair.publicKey,
  [contractAddress],
  Math.floor(Date.now() / 1000).toString(), // startTimeStamp
  "10"                                       // durationDays
);

// 3. 用户签名（移除 EIP712Domain！）
const typesWithoutDomain = { ...eip712.types };
delete typesWithoutDomain.EIP712Domain;

const signature = await signer.signTypedData(
  eip712.domain,
  typesWithoutDomain,
  eip712.message
);

// 4. 解密
const results = await fhevmInstance.userDecrypt(
  [{ handle: encryptedHandle, contractAddress }],
  keypair.privateKey,
  keypair.publicKey,
  signature.replace("0x", ""),  // ✅ 去掉 0x
  [contractAddress],
  userAddress,
  Math.floor(Date.now() / 1000).toString(),
  "10"
);

// 5. 获取值
const decryptedValue = results[encryptedHandle];
```

---

## 🎯 6. View 函数调用

```typescript
// ❌ 错误：使用 provider（当函数依赖 msg.sender 时）
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(address, abi, provider);
await contract.getMyData(); // msg.sender 不正确

// ✅ 正确：使用 signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
await contract.getMyData(); // ✅ msg.sender 正确
```

---

## 🌐 7. Next.js 配置

```javascript
// next.config.js
const nextConfig = {
  transpilePackages: ['@fhevm-sdk'],
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    }];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
};
```

---

## 🔥 8. React 初始化（防止重复）

```typescript
const [fhevmInstance, setFhevmInstance] = useState<any>(null);
const isInitializingRef = useRef(false);

useEffect(() => {
  if (isInitializingRef.current || fhevmInstance) return;
  
  const init = async () => {
    isInitializingRef.current = true;
    try {
      const instance = await relayerSDK.createInstance(config);
      setFhevmInstance(instance);
    } catch (e) {
      isInitializingRef.current = false; // 失败时重置
    }
  };
  
  init();
}, [isConnected, address]); // ✅ 不要把 fhevmInstance 放依赖里
```

---

## ⚙️ 9. Hardhat 配置

```typescript
// hardhat.config.ts
export default {
  networks: {
    sepolia: {
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      gasPrice: 20000000000, // 20 Gwei - 防止 "replacement transaction underpriced"
      accounts: [PRIVATE_KEY],
    },
  },
};
```

---

## 🎨 10. RainbowKit 配置（避免冲突）

```typescript
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  // ❌ 不要导入: baseWallet, coinbaseWallet
} from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  wallets: [
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    // ❌ 不要添加: baseWallet, coinbaseWallet
  ],
});
```

---

## 🐛 11. 常见错误速查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "KMS contract address is not valid or empty" | 配置不完整 | 使用完整的 7 个系统合约地址 |
| "dapp contract is not authorized to user decrypt handle" | 缺少权限 | 添加 `FHE.allowThis()` |
| "Cannot read properties of undefined (reading 'then')" | 对象错误 | 从 `fhevmInstance` 调用，不是 `relayerSDK` |
| "Cannot read properties of undefined (reading 'UserDecryptRequestVerification')" | EIP-712 结构错误 | 移除 `EIP712Domain` 字段 |
| "replacement transaction underpriced" | Gas 价格低 | 设置 `gasPrice: 20000000000` |
| "This browser does not support threads" | CORS 头缺失 | 添加 CORS 头到 `next.config.js` |
| "You have not submitted a commitment yet" (view 函数) | msg.sender 错误 | 使用 `signer` 而不是 `provider` |

---

## 📚 12. 关键资源

- **官方文档**: https://docs.zama.org/protocol
- **合约地址**: https://docs.zama.org/protocol/solidity-guides/smart-contract/configure/contract_addresses
- **迁移指南**: https://docs.zama.org/protocol/solidity-guides/development-guide/migration
- **参考项目**: 
  - [VeriSafe](https://github.com/Markssssssss/VeriSafe)
  - [MediShield](https://github.com/Raymond-yw/MediShield-PreCheck)

---

## ✅ 13. 开发检查清单

**合约部分**:
- [ ] 继承 `EthereumConfig`
- [ ] 导入 `@fhevm/solidity/lib/FHE.sol`
- [ ] 使用 `FHE.allowThis()` + `FHE.allow()`
- [ ] 测试编译通过

**前端部分**:
- [ ] 配置完整的 Sepolia 系统合约地址
- [ ] 使用 `fhevmInstance` 调用所有方法
- [ ] 加密时使用 `handles[0]` 和 `inputProof`
- [ ] 解密时移除 `EIP712Domain`
- [ ] View 函数使用 `signer`
- [ ] 使用 `useRef` 防止重复初始化
- [ ] 添加 CORS 头到 `next.config.js`
- [ ] 移除 Base/Coinbase Wallet

**部署部分**:
- [ ] 设置 `gasPrice: 20000000000`
- [ ] 更新 `.env.local` 合约地址
- [ ] 测试完整流程：连接→加密→提交→解密

---

## 🎯 14. 一句话总结

**FHEVM v0.9 核心变化**：
1. 配置从 `SepoliaConfig` 变为 `EthereumConfig` + 完整系统合约地址
2. 权限模型必须同时使用 `FHE.allowThis()` + `FHE.allow()`
3. 加密返回 `{ handles, inputProof }`，解密需要完整 EIP-712 签名流程

---

**打印这一页，放在桌边，随时查阅！** 📄✨

*最后更新: 2025-11-24*

