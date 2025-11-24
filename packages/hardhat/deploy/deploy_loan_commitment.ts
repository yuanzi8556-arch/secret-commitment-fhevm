import { ethers } from "hardhat";

async function main() {
  console.log("🚀 开始部署 LoanCommitment 合约...\n");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署账户:", deployer.address);
  
  // 检查账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH\n");

  // 部署合约
  console.log("⏳ 正在部署合约...");
  const LoanCommitmentFactory = await ethers.getContractFactory("LoanCommitment");
  const contract = await LoanCommitmentFactory.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ 合约部署成功！\n");
  console.log("📋 部署信息:");
  console.log("   合约地址:", contractAddress);
  console.log("   网络:", (await ethers.provider.getNetwork()).name);
  console.log("   区块高度:", await ethers.provider.getBlockNumber());
  
  // 验证合约初始化
  console.log("\n🔍 验证合约初始化...");
  const contractText = await contract.getContractText();
  console.log("   合同文本长度:", contractText.length, "字符");
  console.log("   合同文本包含 FHEVM:", contractText.includes("FHEVM"));
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 部署完成！");
  console.log("=".repeat(60));
  console.log("\n📝 下一步:");
  console.log("   1. 复制合约地址到前端环境变量:");
  console.log(`      NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("   2. 在 Etherscan 上验证合约:");
  console.log(`      https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("   3. 更新 README.md 中的合约地址");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

