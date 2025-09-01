// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DuckStaking
 * @dev Staking contract for $DUCK tokens with reputation tracking and slashing
 * Features:
 * - Stake $DUCK tokens for voting power
 * - Reputation system based on verification accuracy
 * - Slashing mechanism for dishonest behavior
 * - Withdrawal delays for security
 * - Sqrt-weighted voting power calculation
 */
contract DuckStaking is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");

    IERC20 public immutable duckToken;

    // Minimum stake required for participation (20 DUCK tokens)
    uint256 public constant MIN_STAKE = 20 * 10**18;
    
    // Withdrawal delay period (7 days)
    uint256 public constant WITHDRAWAL_DELAY = 7 days;
    
    // Maximum reputation score
    uint256 public constant MAX_REPUTATION = 1000;
    
    // Initial reputation for new stakers
    uint256 public constant INITIAL_REPUTATION = 500;

    struct StakeInfo {
        uint256 amount;           // Staked amount
        uint256 reputation;       // Reputation score (0-1000)
        uint256 withdrawalTime;   // Timestamp when withdrawal was requested
        uint256 pendingWithdrawal; // Amount pending withdrawal
        uint256 totalVerifications; // Total verifications participated in
        uint256 correctVerifications; // Correct verifications
        bool isSlashed;          // Whether the staker has been slashed
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public isStaker;
    
    address[] public stakers;
    uint256 public totalStaked;

    // Events
    event Staked(address indexed user, uint256 amount);
    event WithdrawalRequested(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Slashed(address indexed user, uint256 amount, string reason);
    event ReputationUpdated(address indexed user, uint256 oldReputation, uint256 newReputation);

    constructor(address _duckToken, address _admin) {
        require(_duckToken != address(0), "Invalid token address");
        require(_admin != address(0), "Invalid admin address");
        
        duckToken = IERC20(_duckToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(SLASHER_ROLE, _admin);
        _grantRole(REPUTATION_MANAGER_ROLE, _admin);
    }

    /**
     * @dev Stake DUCK tokens
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, "Amount below minimum stake");
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // Transfer tokens from user
        duckToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake info
        stakeInfo.amount += amount;
        totalStaked += amount;
        
        // Initialize reputation for new stakers
        if (!isStaker[msg.sender]) {
            stakeInfo.reputation = INITIAL_REPUTATION;
            isStaker[msg.sender] = true;
            stakers.push(msg.sender);
        }
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Request withdrawal of staked tokens
     * @param amount Amount to withdraw
     */
    function requestWithdrawal(uint256 amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= amount, "Insufficient staked amount");
        require(!stakeInfo.isSlashed, "Cannot withdraw while slashed");
        
        // Ensure minimum stake remains after withdrawal
        uint256 remainingStake = stakeInfo.amount - amount;
        if (remainingStake > 0) {
            require(remainingStake >= MIN_STAKE, "Remaining stake below minimum");
        }
        
        stakeInfo.amount -= amount;
        stakeInfo.pendingWithdrawal += amount;
        stakeInfo.withdrawalTime = block.timestamp + WITHDRAWAL_DELAY;
        totalStaked -= amount;
        
        emit WithdrawalRequested(msg.sender, amount);
    }

    /**
     * @dev Complete withdrawal after delay period
     */
    function withdraw() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.pendingWithdrawal > 0, "No pending withdrawal");
        require(block.timestamp >= stakeInfo.withdrawalTime, "Withdrawal delay not met");
        
        uint256 amount = stakeInfo.pendingWithdrawal;
        stakeInfo.pendingWithdrawal = 0;
        stakeInfo.withdrawalTime = 0;
        
        // Remove from stakers list if no stake remaining
        if (stakeInfo.amount == 0) {
            isStaker[msg.sender] = false;
            _removeStaker(msg.sender);
        }
        
        duckToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Slash a staker for dishonest behavior (only SLASHER_ROLE)
     * @param staker Address of the staker to slash
     * @param amount Amount to slash
     * @param reason Reason for slashing
     */
    function slash(address staker, uint256 amount, string calldata reason) 
        external 
        onlyRole(SLASHER_ROLE) 
    {
        StakeInfo storage stakeInfo = stakes[staker];
        require(stakeInfo.amount >= amount, "Insufficient stake to slash");
        
        stakeInfo.amount -= amount;
        stakeInfo.isSlashed = true;
        totalStaked -= amount;
        
        // Reduce reputation significantly
        stakeInfo.reputation = stakeInfo.reputation / 2;
        
        emit Slashed(staker, amount, reason);
    }

    /**
     * @dev Update reputation based on verification results (only REPUTATION_MANAGER_ROLE)
     * @param staker Address of the staker
     * @param wasCorrect Whether the verification was correct
     */
    function updateReputation(address staker, bool wasCorrect) 
        external 
        onlyRole(REPUTATION_MANAGER_ROLE) 
    {
        StakeInfo storage stakeInfo = stakes[staker];
        require(isStaker[staker], "Not a staker");
        
        uint256 oldReputation = stakeInfo.reputation;
        stakeInfo.totalVerifications++;
        
        if (wasCorrect) {
            stakeInfo.correctVerifications++;
            // Increase reputation (max 1000)
            stakeInfo.reputation = Math.min(MAX_REPUTATION, stakeInfo.reputation + 10);
        } else {
            // Decrease reputation (min 0)
            stakeInfo.reputation = stakeInfo.reputation > 5 ? stakeInfo.reputation - 5 : 0;
        }
        
        emit ReputationUpdated(staker, oldReputation, stakeInfo.reputation);
    }

    /**
     * @dev Calculate voting weight using sqrt stake weighting and reputation
     * Formula: w_i = √(stake_i) × (reputation_i)^0.7 × e^(-0.1 × days_since_vote)
     * @param staker Address of the staker
     * @param daysSinceVote Days since last vote (for time decay)
     * @return Voting weight
     */
    function calculateVotingWeight(address staker, uint256 daysSinceVote) 
        external 
        view 
        returns (uint256) 
    {
        StakeInfo memory stakeInfo = stakes[staker];
        if (stakeInfo.amount < MIN_STAKE || stakeInfo.isSlashed) {
            return 0;
        }
        
        // √(stake_i) - square root of stake
        uint256 sqrtStake = Math.sqrt(stakeInfo.amount);
        
        // (reputation_i)^0.7 - reputation factor (approximated)
        uint256 reputationFactor = _powApprox(stakeInfo.reputation, 70, 100);
        
        // e^(-0.1 × days_since_vote) - time decay (approximated)
        uint256 timeFactor = _expDecay(daysSinceVote);
        
        return (sqrtStake * reputationFactor * timeFactor) / (100 * 100);
    }

    /**
     * @dev Get staker information
     * @param staker Address of the staker
     * @return StakeInfo struct
     */
    function getStakeInfo(address staker) external view returns (StakeInfo memory) {
        return stakes[staker];
    }

    /**
     * @dev Get all stakers
     * @return Array of staker addresses
     */
    function getAllStakers() external view returns (address[] memory) {
        return stakers;
    }

    /**
     * @dev Get accuracy rate for a staker
     * @param staker Address of the staker
     * @return Accuracy rate as percentage (0-100)
     */
    function getAccuracyRate(address staker) external view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[staker];
        if (stakeInfo.totalVerifications == 0) {
            return 0;
        }
        return (stakeInfo.correctVerifications * 100) / stakeInfo.totalVerifications;
    }

    /**
     * @dev Pause the contract (only DEFAULT_ADMIN_ROLE)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract (only DEFAULT_ADMIN_ROLE)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Internal functions

    /**
     * @dev Remove staker from the stakers array
     * @param staker Address to remove
     */
    function _removeStaker(address staker) internal {
        for (uint256 i = 0; i < stakers.length; i++) {
            if (stakers[i] == staker) {
                stakers[i] = stakers[stakers.length - 1];
                stakers.pop();
                break;
            }
        }
    }

    /**
     * @dev Approximate power function for reputation calculation
     * @param base Base value
     * @param exp Exponent (as percentage, e.g., 70 for 0.7)
     * @param precision Precision factor (e.g., 100)
     * @return Approximated result
     */
    function _powApprox(uint256 base, uint256 exp, uint256 precision) internal pure returns (uint256) {
        if (base == 0) return 0;
        if (exp == 0) return precision;
        
        // Simple approximation: base^(exp/precision) ≈ base * exp / precision
        return (base * exp) / precision;
    }

    /**
     * @dev Approximate exponential decay for time factor
     * @param days Number of days
     * @return Decay factor (0-100)
     */
    function _expDecay(uint256 days) internal pure returns (uint256) {
        if (days == 0) return 100;
        if (days >= 50) return 1; // Minimum decay factor
        
        // Approximation: e^(-0.1 * days) ≈ 100 - 10 * days (capped at 1)
        uint256 decay = days * 10;
        return decay >= 99 ? 1 : 100 - decay;
    }
}
