// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./DuckStaking.sol";

/**
 * @title VerificationBounty
 * @dev Bounty system for fact verification with stake-weighted consensus
 * Features:
 * - Create verification bounties for claims
 * - Submit evidence with stake requirements
 * - Stake-weighted consensus resolution
 * - Reward distribution to accurate verifiers
 * - Commit-reveal voting to prevent manipulation
 */
contract VerificationBounty is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant BOUNTY_CREATOR_ROLE = keccak256("BOUNTY_CREATOR_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    IERC20 public immutable duckToken;
    DuckStaking public immutable stakingContract;

    // Minimum stake required to participate in verification
    uint256 public constant MIN_VERIFICATION_STAKE = 20 * 10**18;
    
    // Voting period duration (3 days)
    uint256 public constant VOTING_PERIOD = 3 days;
    
    // Reveal period duration (1 day)
    uint256 public constant REVEAL_PERIOD = 1 day;

    enum BountyStatus {
        Active,      // Accepting evidence submissions
        Voting,      // In voting phase
        Revealing,   // In reveal phase
        Resolved,    // Consensus reached
        Disputed     // Needs manual resolution
    }

    enum VerificationResult {
        Pending,
        True,
        False,
        Inconclusive
    }

    struct Bounty {
        uint256 id;
        string claim;                    // The claim to verify
        string description;              // Additional context
        address creator;                 // Who created the bounty
        uint256 reward;                  // Total reward pool
        uint256 createdAt;              // Creation timestamp
        uint256 votingStartTime;        // When voting phase starts
        BountyStatus status;            // Current status
        VerificationResult result;      // Final result
        uint256 totalVotingWeight;     // Total weight of all votes
        uint256 trueVotes;             // Weight of "true" votes
        uint256 falseVotes;            // Weight of "false" votes
        uint256 inconclusiveVotes;     // Weight of "inconclusive" votes
    }

    struct Evidence {
        uint256 bountyId;
        address submitter;
        string evidenceUri;             // IPFS hash or URL
        string description;
        uint256 stake;                  // Stake amount
        uint256 submittedAt;
        bool isSupporting;              // True if supporting the claim
    }

    struct Vote {
        bytes32 commitHash;             // Commit hash (vote + nonce)
        VerificationResult vote;        // Revealed vote
        uint256 weight;                 // Voting weight
        bool hasRevealed;              // Whether vote was revealed
        uint256 stake;                 // Stake amount for this vote
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Evidence[]) public bountyEvidence;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => address[]) public voters;
    
    uint256 public nextBountyId = 1;
    uint256 public totalBounties;

    // Events
    event BountyCreated(uint256 indexed bountyId, address indexed creator, string claim, uint256 reward);
    event EvidenceSubmitted(uint256 indexed bountyId, address indexed submitter, string evidenceUri, uint256 stake);
    event VoteCommitted(uint256 indexed bountyId, address indexed voter, uint256 stake);
    event VoteRevealed(uint256 indexed bountyId, address indexed voter, VerificationResult vote, uint256 weight);
    event BountyResolved(uint256 indexed bountyId, VerificationResult result, uint256 totalReward);
    event RewardDistributed(uint256 indexed bountyId, address indexed recipient, uint256 amount);

    constructor(
        address _duckToken,
        address _stakingContract,
        address _admin
    ) {
        require(_duckToken != address(0), "Invalid token address");
        require(_stakingContract != address(0), "Invalid staking contract");
        require(_admin != address(0), "Invalid admin address");
        
        duckToken = IERC20(_duckToken);
        stakingContract = DuckStaking(_stakingContract);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(BOUNTY_CREATOR_ROLE, _admin);
        _grantRole(RESOLVER_ROLE, _admin);
    }

    /**
     * @dev Create a new verification bounty
     * @param claim The claim to be verified
     * @param description Additional context
     * @param reward Reward amount in DUCK tokens
     */
    function createBounty(
        string calldata claim,
        string calldata description,
        uint256 reward
    ) external onlyRole(BOUNTY_CREATOR_ROLE) nonReentrant whenNotPaused {
        require(bytes(claim).length > 0, "Claim cannot be empty");
        require(reward > 0, "Reward must be positive");
        
        // Transfer reward tokens to contract
        duckToken.safeTransferFrom(msg.sender, address(this), reward);
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            claim: claim,
            description: description,
            creator: msg.sender,
            reward: reward,
            createdAt: block.timestamp,
            votingStartTime: 0,
            status: BountyStatus.Active,
            result: VerificationResult.Pending,
            totalVotingWeight: 0,
            trueVotes: 0,
            falseVotes: 0,
            inconclusiveVotes: 0
        });
        
        totalBounties++;
        
        emit BountyCreated(bountyId, msg.sender, claim, reward);
    }

    /**
     * @dev Submit evidence for a bounty
     * @param bountyId ID of the bounty
     * @param evidenceUri IPFS hash or URL of evidence
     * @param description Description of the evidence
     * @param isSupporting Whether evidence supports the claim
     * @param stakeAmount Amount to stake on this evidence
     */
    function submitEvidence(
        uint256 bountyId,
        string calldata evidenceUri,
        string calldata description,
        bool isSupporting,
        uint256 stakeAmount
    ) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Active, "Bounty not accepting evidence");
        require(stakeAmount >= MIN_VERIFICATION_STAKE, "Insufficient stake");
        require(bytes(evidenceUri).length > 0, "Evidence URI required");
        
        // Transfer stake from submitter
        duckToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        Evidence memory evidence = Evidence({
            bountyId: bountyId,
            submitter: msg.sender,
            evidenceUri: evidenceUri,
            description: description,
            stake: stakeAmount,
            submittedAt: block.timestamp,
            isSupporting: isSupporting
        });
        
        bountyEvidence[bountyId].push(evidence);
        
        emit EvidenceSubmitted(bountyId, msg.sender, evidenceUri, stakeAmount);
    }

    /**
     * @dev Start voting phase for a bounty (only RESOLVER_ROLE)
     * @param bountyId ID of the bounty
     */
    function startVoting(uint256 bountyId) external onlyRole(RESOLVER_ROLE) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Active, "Invalid bounty status");
        require(bountyEvidence[bountyId].length > 0, "No evidence submitted");
        
        bounty.status = BountyStatus.Voting;
        bounty.votingStartTime = block.timestamp;
    }

    /**
     * @dev Commit a vote (commit-reveal scheme)
     * @param bountyId ID of the bounty
     * @param commitHash Hash of (vote + nonce)
     * @param stakeAmount Amount to stake on this vote
     */
    function commitVote(
        uint256 bountyId,
        bytes32 commitHash,
        uint256 stakeAmount
    ) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Voting, "Not in voting phase");
        require(block.timestamp < bounty.votingStartTime + VOTING_PERIOD, "Voting period ended");
        require(stakeAmount >= MIN_VERIFICATION_STAKE, "Insufficient stake");
        require(votes[bountyId][msg.sender].commitHash == bytes32(0), "Already voted");
        
        // Must be a staker to vote
        require(stakingContract.isStaker(msg.sender), "Must be a staker");
        
        // Transfer stake from voter
        duckToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        votes[bountyId][msg.sender] = Vote({
            commitHash: commitHash,
            vote: VerificationResult.Pending,
            weight: 0,
            hasRevealed: false,
            stake: stakeAmount
        });
        
        voters[bountyId].push(msg.sender);
        
        emit VoteCommitted(bountyId, msg.sender, stakeAmount);
    }

    /**
     * @dev Reveal a vote
     * @param bountyId ID of the bounty
     * @param vote The actual vote
     * @param nonce Random nonce used in commit
     */
    function revealVote(
        uint256 bountyId,
        VerificationResult vote,
        uint256 nonce
    ) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Voting || bounty.status == BountyStatus.Revealing, "Invalid phase");
        
        // Check if we're in reveal period
        if (bounty.status == BountyStatus.Voting) {
            require(block.timestamp >= bounty.votingStartTime + VOTING_PERIOD, "Voting still active");
            bounty.status = BountyStatus.Revealing;
        }
        
        require(block.timestamp < bounty.votingStartTime + VOTING_PERIOD + REVEAL_PERIOD, "Reveal period ended");
        
        Vote storage voterVote = votes[bountyId][msg.sender];
        require(voterVote.commitHash != bytes32(0), "No committed vote");
        require(!voterVote.hasRevealed, "Already revealed");
        
        // Verify commit hash
        bytes32 hash = keccak256(abi.encodePacked(vote, nonce));
        require(hash == voterVote.commitHash, "Invalid reveal");
        
        // Calculate voting weight
        uint256 weight = stakingContract.calculateVotingWeight(msg.sender, 0);
        require(weight > 0, "No voting weight");
        
        voterVote.vote = vote;
        voterVote.weight = weight;
        voterVote.hasRevealed = true;
        
        // Update vote tallies
        bounty.totalVotingWeight += weight;
        if (vote == VerificationResult.True) {
            bounty.trueVotes += weight;
        } else if (vote == VerificationResult.False) {
            bounty.falseVotes += weight;
        } else if (vote == VerificationResult.Inconclusive) {
            bounty.inconclusiveVotes += weight;
        }
        
        emit VoteRevealed(bountyId, msg.sender, vote, weight);
    }

    /**
     * @dev Resolve bounty based on consensus
     * @param bountyId ID of the bounty
     */
    function resolveBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Revealing, "Not in revealing phase");
        require(block.timestamp >= bounty.votingStartTime + VOTING_PERIOD + REVEAL_PERIOD, "Reveal period not ended");
        
        // Determine consensus
        VerificationResult result;
        if (bounty.trueVotes > bounty.falseVotes && bounty.trueVotes > bounty.inconclusiveVotes) {
            result = VerificationResult.True;
        } else if (bounty.falseVotes > bounty.trueVotes && bounty.falseVotes > bounty.inconclusiveVotes) {
            result = VerificationResult.False;
        } else {
            result = VerificationResult.Inconclusive;
        }
        
        bounty.result = result;
        bounty.status = BountyStatus.Resolved;
        
        // Distribute rewards to correct voters
        _distributeRewards(bountyId, result);
        
        emit BountyResolved(bountyId, result, bounty.reward);
    }

    /**
     * @dev Get bounty information
     * @param bountyId ID of the bounty
     * @return Bounty struct
     */
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }

    /**
     * @dev Get evidence for a bounty
     * @param bountyId ID of the bounty
     * @return Array of Evidence structs
     */
    function getBountyEvidence(uint256 bountyId) external view returns (Evidence[] memory) {
        return bountyEvidence[bountyId];
    }

    /**
     * @dev Get voters for a bounty
     * @param bountyId ID of the bounty
     * @return Array of voter addresses
     */
    function getBountyVoters(uint256 bountyId) external view returns (address[] memory) {
        return voters[bountyId];
    }

    // Internal functions

    /**
     * @dev Distribute rewards to correct voters
     * @param bountyId ID of the bounty
     * @param correctResult The correct verification result
     */
    function _distributeRewards(uint256 bountyId, VerificationResult correctResult) internal {
        Bounty storage bounty = bounties[bountyId];
        address[] memory bountyVoters = voters[bountyId];
        
        uint256 correctVotesWeight = 0;
        
        // Calculate total weight of correct votes
        for (uint256 i = 0; i < bountyVoters.length; i++) {
            Vote storage vote = votes[bountyId][bountyVoters[i]];
            if (vote.hasRevealed && vote.vote == correctResult) {
                correctVotesWeight += vote.weight;
            }
        }
        
        if (correctVotesWeight == 0) {
            // No correct votes, return reward to creator
            duckToken.safeTransfer(bounty.creator, bounty.reward);
            return;
        }
        
        // Distribute rewards proportionally
        for (uint256 i = 0; i < bountyVoters.length; i++) {
            address voter = bountyVoters[i];
            Vote storage vote = votes[bountyId][voter];
            
            if (vote.hasRevealed && vote.vote == correctResult) {
                // Calculate reward share
                uint256 rewardShare = (bounty.reward * vote.weight) / correctVotesWeight;
                
                // Return stake + reward
                uint256 totalPayout = vote.stake + rewardShare;
                duckToken.safeTransfer(voter, totalPayout);
                
                // Update reputation
                stakingContract.updateReputation(voter, true);
                
                emit RewardDistributed(bountyId, voter, totalPayout);
            } else if (vote.hasRevealed) {
                // Wrong vote - lose stake but update reputation
                stakingContract.updateReputation(voter, false);
            } else {
                // Didn't reveal - return stake
                duckToken.safeTransfer(voter, vote.stake);
            }
        }
    }
}
