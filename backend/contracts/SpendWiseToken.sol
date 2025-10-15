// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract SpendWiseToken is IERC20 {
    string public constant name = "SpendWise Token";
    string public constant symbol = "SWT";
    uint8 public constant decimals = 18;
    uint256 private _totalSupply = 1000000 * 10**decimals; // 1,000,000 SWT

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(bytes32 => bool) public transactionProofs;

    address public owner;
    address public rewardDistributor;

    event RewardDistributed(address indexed to, uint256 amount, string reason);
    event TransactionProofStored(bytes32 indexed proofHash, address indexed user);
    event RewardDistributorChanged(address indexed oldDistributor, address indexed newDistributor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRewardDistributor() {
        require(msg.sender == rewardDistributor || msg.sender == owner, "Only reward distributor can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        rewardDistributor = msg.sender;
        _balances[owner] = _totalSupply;
        emit Transfer(address(0), owner, _totalSupply);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address tokenOwner, address spender) public view override returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");

        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);

        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(_balances[sender] >= amount, "ERC20: transfer amount exceeds balance");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address tokenOwner, address spender, uint256 amount) internal {
        require(tokenOwner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }

    // Reward distribution functions
    function distributeReward(address to, uint256 amount, string memory reason) external onlyRewardDistributor {
        require(to != address(0), "Cannot distribute to zero address");
        require(_balances[owner] >= amount, "Insufficient tokens for reward");

        _transfer(owner, to, amount);
        emit RewardDistributed(to, amount, reason);
    }

    function batchDistributeRewards(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory reason
    ) external onlyRewardDistributor {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot distribute to zero address");
            require(_balances[owner] >= amounts[i], "Insufficient tokens for reward");
            
            _transfer(owner, recipients[i], amounts[i]);
            emit RewardDistributed(recipients[i], amounts[i], reason);
        }
    }

    // Transaction proof functions
    function storeTransactionProof(bytes32 proofHash) external onlyRewardDistributor {
        require(proofHash != bytes32(0), "Invalid proof hash");
        require(!transactionProofs[proofHash], "Proof already exists");
        
        transactionProofs[proofHash] = true;
        emit TransactionProofStored(proofHash, msg.sender);
    }

    function verifyTransactionProof(bytes32 proofHash) external view returns (bool) {
        return transactionProofs[proofHash];
    }

    function batchStoreProofs(bytes32[] memory proofHashes) external onlyRewardDistributor {
        for (uint256 i = 0; i < proofHashes.length; i++) {
            require(proofHashes[i] != bytes32(0), "Invalid proof hash");
            require(!transactionProofs[proofHashes[i]], "Proof already exists");
            
            transactionProofs[proofHashes[i]] = true;
            emit TransactionProofStored(proofHashes[i], msg.sender);
        }
    }

    // Admin functions
    function setRewardDistributor(address newDistributor) external onlyOwner {
        require(newDistributor != address(0), "Invalid distributor address");
        address oldDistributor = rewardDistributor;
        rewardDistributor = newDistributor;
        emit RewardDistributorChanged(oldDistributor, newDistributor);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = _balances[address(this)];
        if (balance > 0) {
            _transfer(address(this), owner, balance);
        }
    }

    // View functions for frontend integration
    function getRewardPool() external view returns (uint256) {
        return _balances[owner];
    }

    function getContractInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        address contractOwner,
        address currentRewardDistributor
    ) {
        return (name, symbol, decimals, _totalSupply, owner, rewardDistributor);
    }
}
