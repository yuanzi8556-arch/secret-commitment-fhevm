// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title LoanCommitment
 * @notice 链上借贷意愿承诺平台 - 用户可以加密提交借贷金额承诺
 * @dev 使用 FHEVM 同态加密保护用户隐私
 */
contract LoanCommitment is EthereumConfig {
    
    // ==================== 状态变量 ====================
    
    /// @notice 合同文本内容
    string public contractText;
    
    /// @notice 存储每个用户的加密承诺金额
    mapping(address => euint32) private userCommitments;
    
    /// @notice 记录用户是否已提交承诺
    mapping(address => bool) public hasCommitted;
    
    /// @notice 记录用户提交时间
    mapping(address => uint256) public commitmentTimestamp;
    
    
    // ==================== 事件 ====================
    
    /// @notice 用户提交承诺时触发
    event CommitmentSubmitted(address indexed user, uint256 timestamp);
    
    /// @notice 用户查看承诺时触发
    event CommitmentViewed(address indexed user);
    
    
    // ==================== 构造函数 ====================
    
    /**
     * @notice 初始化合约，设置标准借贷合同文本
     */
    constructor() {
        contractText = unicode"================================\n标准 USDT 借贷意愿承诺书\n================================\n\n本人通过此智能合约郑重承诺：\n\n1. 承诺类型：\n   □ 愿意借出 USDT\n   □ 愿意借入 USDT\n\n2. 承诺金额：\n   本人承诺的金额已通过加密方式提交至区块链，\n   仅本人可查看具体金额，该承诺具有不可篡改性。\n\n3. 合同条款：\n   - 本承诺记录于以太坊区块链，具有时间戳证明\n   - 承诺金额通过 FHEVM 加密存储，保护隐私\n   - 本人可随时查看自己的承诺记录\n   - 本承诺不构成法律义务，仅作为意愿表达\n\n4. 隐私声明：\n   通过同态加密技术，您的承诺金额将被加密存储，\n   只有您本人可以解密查看，其他任何人（包括合约\n   所有者）都无法获知您的具体金额。\n\n5. 技术支持：\n   本合约基于 Zama FHEVM 技术，部署于以太坊\n   Sepolia 测试网，代码开源可审计。\n\n================================";
    }
    
    
    // ==================== 核心函数 ====================
    
    /**
     * @notice 提交加密的金额承诺
     * @param encryptedAmount 加密的承诺金额（USDT，单位：wei）
     * @param proof 加密证明
     */
    function submitCommitment(
        externalEuint32 encryptedAmount,
        bytes calldata proof
    ) external {
        // 验证并转换用户加密输入
        euint32 amount = FHE.fromExternal(encryptedAmount, proof);
        
        // 存储加密的承诺金额
        userCommitments[msg.sender] = amount;
        
        // 标记用户已提交
        hasCommitted[msg.sender] = true;
        
        // 记录提交时间
        commitmentTimestamp[msg.sender] = block.timestamp;
        
        // 授予合约自己的访问权限（必需！）
        FHE.allowThis(amount);
        
        // 授予用户解密权限（关键！）
        FHE.allow(amount, msg.sender);
        
        // 触发事件
        emit CommitmentSubmitted(msg.sender, block.timestamp);
    }
    
    
    /**
     * @notice 获取自己的加密承诺金额句柄
     * @dev 只能查看自己的承诺
     * @return 加密数据的 bytes32 句柄
     */
    function getMyCommitment() external view returns (bytes32) {
        require(hasCommitted[msg.sender], "You have not submitted a commitment yet");
        
        // 返回加密数据的句柄，前端可以用此句柄解密
        return FHE.toBytes32(userCommitments[msg.sender]);
    }
    
    
    /**
     * @notice 检查指定地址是否已提交承诺
     * @param user 要查询的用户地址
     * @return 是否已提交
     */
    function hasUserCommitted(address user) external view returns (bool) {
        return hasCommitted[user];
    }
    
    
    /**
     * @notice 获取自己的提交时间
     * @return 提交时间戳
     */
    function getMyCommitmentTimestamp() external view returns (uint256) {
        require(hasCommitted[msg.sender], "You have not submitted a commitment yet");
        return commitmentTimestamp[msg.sender];
    }
    
    
    /**
     * @notice 获取合同文本内容
     * @return 合同文本
     */
    function getContractText() external view returns (string memory) {
        return contractText;
    }
}

