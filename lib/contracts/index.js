// Contract integration helpers for DuckWire frontend
import { getContract } from 'wagmi';
import { duckChain } from '../chains/duckchain.js';

// Contract ABIs (simplified for key functions)
export const DUCK_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function getVotes(address account) view returns (uint256)',
  'function delegate(address delegatee)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

export const STAKING_ABI = [
  'function stake(uint256 amount)',
  'function requestWithdrawal(uint256 amount)',
  'function withdraw()',
  'function getStakeInfo(address staker) view returns (tuple(uint256 amount, uint256 reputation, uint256 withdrawalTime, uint256 pendingWithdrawal, uint256 totalVerifications, uint256 correctVerifications, bool isSlashed))',
  'function calculateVotingWeight(address staker, uint256 daysSinceVote) view returns (uint256)',
  'function getAccuracyRate(address staker) view returns (uint256)',
  'function getAllStakers() view returns (address[])',
  'function isStaker(address) view returns (bool)',
  'function totalStaked() view returns (uint256)',
  'function MIN_STAKE() view returns (uint256)',
  'function WITHDRAWAL_DELAY() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event WithdrawalRequested(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event ReputationUpdated(address indexed user, uint256 oldReputation, uint256 newReputation)'
];

export const BOUNTY_ABI = [
  'function createBounty(string claim, string description, uint256 reward)',
  'function submitEvidence(uint256 bountyId, string evidenceUri, string description, bool isSupporting, uint256 stakeAmount)',
  'function startVoting(uint256 bountyId)',
  'function commitVote(uint256 bountyId, bytes32 commitHash, uint256 stakeAmount)',
  'function revealVote(uint256 bountyId, uint8 vote, uint256 nonce)',
  'function resolveBounty(uint256 bountyId)',
  'function getBounty(uint256 bountyId) view returns (tuple(uint256 id, string claim, string description, address creator, uint256 reward, uint256 createdAt, uint256 votingStartTime, uint8 status, uint8 result, uint256 totalVotingWeight, uint256 trueVotes, uint256 falseVotes, uint256 inconclusiveVotes))',
  'function getBountyEvidence(uint256 bountyId) view returns (tuple(uint256 bountyId, address submitter, string evidenceUri, string description, uint256 stake, uint256 submittedAt, bool isSupporting)[])',
  'function getBountyVoters(uint256 bountyId) view returns (address[])',
  'function nextBountyId() view returns (uint256)',
  'function totalBounties() view returns (uint256)',
  'event BountyCreated(uint256 indexed bountyId, address indexed creator, string claim, uint256 reward)',
  'event EvidenceSubmitted(uint256 indexed bountyId, address indexed submitter, string evidenceUri, uint256 stake)',
  'event VoteCommitted(uint256 indexed bountyId, address indexed voter, uint256 stake)',
  'event VoteRevealed(uint256 indexed bountyId, address indexed voter, uint8 vote, uint256 weight)',
  'event BountyResolved(uint256 indexed bountyId, uint8 result, uint256 totalReward)'
];

// Contract addresses (to be populated after deployment)
export const CONTRACT_ADDRESSES = {
  [duckChain.id]: {
    DUCK_TOKEN: process.env.NEXT_PUBLIC_DUCK_TOKEN_ADDRESS,
    STAKING: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
    BOUNTY: process.env.NEXT_PUBLIC_BOUNTY_CONTRACT_ADDRESS,
  }
};

// Contract instances
export function getDuckTokenContract(chainId = duckChain.id) {
  const address = CONTRACT_ADDRESSES[chainId]?.DUCK_TOKEN;
  if (!address) throw new Error(`DuckToken not deployed on chain ${chainId}`);
  
  return getContract({
    address,
    abi: DUCK_TOKEN_ABI,
    chainId,
  });
}

export function getStakingContract(chainId = duckChain.id) {
  const address = CONTRACT_ADDRESSES[chainId]?.STAKING;
  if (!address) throw new Error(`Staking contract not deployed on chain ${chainId}`);
  
  return getContract({
    address,
    abi: STAKING_ABI,
    chainId,
  });
}

export function getBountyContract(chainId = duckChain.id) {
  const address = CONTRACT_ADDRESSES[chainId]?.BOUNTY;
  if (!address) throw new Error(`Bounty contract not deployed on chain ${chainId}`);
  
  return getContract({
    address,
    abi: BOUNTY_ABI,
    chainId,
  });
}

// Utility functions
export function formatDuckAmount(amount) {
  return (Number(amount) / 1e18).toLocaleString();
}

export function parseDuckAmount(amount) {
  return BigInt(Math.floor(Number(amount) * 1e18));
}

export function calculateVotingPower(stakeAmount, reputation = 500, daysSinceVote = 0) {
  // w_i = √(stake_i) × (reputation_i)^0.7 × e^(-0.1 × days_since_vote)
  const sqrtStake = Math.sqrt(Number(stakeAmount) / 1e18);
  const reputationFactor = Math.pow(reputation / 1000, 0.7);
  const timeFactor = Math.exp(-0.1 * daysSinceVote);
  
  return sqrtStake * reputationFactor * timeFactor;
}

export const VERIFICATION_RESULTS = {
  PENDING: 0,
  TRUE: 1,
  FALSE: 2,
  INCONCLUSIVE: 3
};

export const BOUNTY_STATUS = {
  ACTIVE: 0,
  VOTING: 1,
  REVEALING: 2,
  RESOLVED: 3,
  DISPUTED: 4
};

export function getVerificationResultLabel(result) {
  switch (result) {
    case VERIFICATION_RESULTS.TRUE: return 'True';
    case VERIFICATION_RESULTS.FALSE: return 'False';
    case VERIFICATION_RESULTS.INCONCLUSIVE: return 'Inconclusive';
    default: return 'Pending';
  }
}

export function getBountyStatusLabel(status) {
  switch (status) {
    case BOUNTY_STATUS.ACTIVE: return 'Accepting Evidence';
    case BOUNTY_STATUS.VOTING: return 'Voting Phase';
    case BOUNTY_STATUS.REVEALING: return 'Reveal Phase';
    case BOUNTY_STATUS.RESOLVED: return 'Resolved';
    case BOUNTY_STATUS.DISPUTED: return 'Disputed';
    default: return 'Unknown';
  }
}
