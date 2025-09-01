const { expect } = require("chai");
const { ethers } = require("hardhat");

// Enum mapping must match VerificationBounty.VerificationResult
const VerificationResult = {
  Pending: 0,
  True: 1,
  False: 2,
  Inconclusive: 3,
};

describe("VerificationBounty", function () {
  let duckToken, duckStaking, verificationBounty;
  let owner, user1, user2, userEvidence;

  const REWARD = ethers.parseEther("1000");
  const MIN_STAKE = ethers.parseEther("20");
  const VOTE_STAKE = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, user1, user2, userEvidence] = await ethers.getSigners();

    // Deploy DuckToken
    const DuckToken = await ethers.getContractFactory("DuckToken");
    duckToken = await DuckToken.deploy(
      "DuckWire Token",
      "DUCK",
      owner.address,
      ethers.parseEther("10000000") // 10M initial supply
    );

    // Deploy DuckStaking
    const DuckStaking = await ethers.getContractFactory("DuckStaking");
    duckStaking = await DuckStaking.deploy(duckToken.target, owner.address);

    // Deploy VerificationBounty with owner as admin (has creator & resolver roles)
    const VerificationBounty = await ethers.getContractFactory("VerificationBounty");
    verificationBounty = await VerificationBounty.deploy(
      duckToken.target,
      duckStaking.target,
      owner.address
    );

    // Grant REPUTATION_MANAGER_ROLE to bounty so it can update reputation
    const REPUTATION_MANAGER_ROLE = await duckStaking.REPUTATION_MANAGER_ROLE();
    await duckStaking.grantRole(REPUTATION_MANAGER_ROLE, verificationBounty.target);

    // Fund users
    await duckToken.transfer(user1.address, ethers.parseEther("10000"));
    await duckToken.transfer(user2.address, ethers.parseEther("10000"));
    await duckToken.transfer(userEvidence.address, ethers.parseEther("10000"));

    // Approvals for staking
    await duckToken.connect(user1).approve(duckStaking.target, ethers.parseEther("10000"));
    await duckToken.connect(user2).approve(duckStaking.target, ethers.parseEther("10000"));

    // Stake for voting power (user1 more than user2 so True will win)
    await duckStaking.connect(user1).stake(ethers.parseEther("400"));
    await duckStaking.connect(user2).stake(ethers.parseEther("100"));

    // Approvals for committing vote stakes
    await duckToken.connect(user1).approve(verificationBounty.target, ethers.parseEther("10000"));
    await duckToken.connect(user2).approve(verificationBounty.target, ethers.parseEther("10000"));
    await duckToken.connect(userEvidence).approve(verificationBounty.target, ethers.parseEther("10000"));

    // Owner approval for reward & potential evidence
    await duckToken.connect(owner).approve(verificationBounty.target, ethers.parseEther("1000000"));
  });

  async function createBountyWithEvidence() {
    // Create bounty
    await verificationBounty
      .connect(owner)
      .createBounty("Claim A is correct", "Test bounty", REWARD);

    // Submit at least one piece of evidence to allow startVoting
    await verificationBounty
      .connect(userEvidence)
      .submitEvidence(1, "ipfs://hash", "evidence", true, MIN_STAKE);
  }

  function commitHashFor(vote, nonce) {
    // abi.encodePacked(uint8(vote), uint256(nonce))
    return ethers.solidityPackedKeccak256(["uint8", "uint256"], [vote, nonce]);
  }

  it("Happy path: commit-reveal, consensus, reward distribution, reputation updates", async function () {
    await createBountyWithEvidence();

    // Start voting
    await verificationBounty.connect(owner).startVoting(1);

    // Prepare commits
    const nonce1 = 123n;
    const nonce2 = 456n;
    const commit1 = commitHashFor(VerificationResult.True, nonce1);
    const commit2 = commitHashFor(VerificationResult.False, nonce2);

    // Capture balances after staking, before commit (to isolate voting effects)
    const u1Before = await duckToken.balanceOf(user1.address);
    const u2Before = await duckToken.balanceOf(user2.address);

    // Commit votes with stakes
    await verificationBounty.connect(user1).commitVote(1, commit1, VOTE_STAKE);
    await verificationBounty.connect(user2).commitVote(1, commit2, VOTE_STAKE);

    // Time travel to end of voting period (3 days)
    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Reveal votes
    await verificationBounty
      .connect(user1)
      .revealVote(1, VerificationResult.True, nonce1);
    await verificationBounty
      .connect(user2)
      .revealVote(1, VerificationResult.False, nonce2);

    // Compute expected weights BEFORE resolution (reputation not yet updated)
    const w1 = await duckStaking.calculateVotingWeight(user1.address, 0);
    const w2 = await duckStaking.calculateVotingWeight(user2.address, 0);

    // Time travel to end of reveal period (1 day)
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Resolve
    await verificationBounty.resolveBounty(1);

    const bounty = await verificationBounty.getBounty(1);
    expect(bounty.status).to.equal(3); // Resolved
    expect(bounty.result).to.equal(VerificationResult.True);

    // Balances after resolution
    const u1After = await duckToken.balanceOf(user1.address);
    const u2After = await duckToken.balanceOf(user2.address);

    // User1 voted correctly: net change equals reward share (stake returned + share - stake committed)
    const correctWeight = w1;
    const totalCorrect = w1; // only user1 on correct side
    const expectedShare1 = (REWARD * correctWeight) / totalCorrect;
    expect(u1After - u1Before).to.equal(expectedShare1);

    // User2 voted incorrectly: loses stake
    expect(u2After).to.equal(u2Before - VOTE_STAKE);

    // Reputation updates
    const s1 = await duckStaking.getStakeInfo(user1.address);
    const s2 = await duckStaking.getStakeInfo(user2.address);
    expect(s1.totalVerifications).to.equal(1);
    expect(s1.correctVerifications).to.equal(1);
    expect(s2.totalVerifications).to.equal(1);
    expect(s2.correctVerifications).to.equal(0);
  });

  it("Prevents non-stakers and enforces minimum stake", async function () {
    await createBountyWithEvidence();
    await verificationBounty.connect(owner).startVoting(1);

    // New signer without staking
    const [_, __, ___, ____, outsider] = await ethers.getSigners();
    await duckToken.transfer(outsider.address, ethers.parseEther("100"));
    await duckToken.connect(outsider).approve(verificationBounty.target, ethers.parseEther("100"));

    const c = commitHashFor(VerificationResult.True, 1);

    await expect(
      verificationBounty.connect(outsider).commitVote(1, c, VOTE_STAKE)
    ).to.be.revertedWith("Must be a staker");

    // User1 is staker but below minimum stake for this action
    await expect(
      verificationBounty.connect(user1).commitVote(1, c, ethers.parseEther("10"))
    ).to.be.revertedWith("Insufficient stake");
  });

  it("Enforces commit-reveal integrity and timing", async function () {
    await createBountyWithEvidence();
    await verificationBounty.connect(owner).startVoting(1);

    const nonce = 99n;
    const commit = commitHashFor(VerificationResult.True, nonce);

    await verificationBounty.connect(user1).commitVote(1, commit, VOTE_STAKE);

    // Wrong reveal (bad nonce)
    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(
      verificationBounty
        .connect(user1)
        .revealVote(1, VerificationResult.True, 1000)
    ).to.be.revertedWith("Invalid reveal");

    // Correct reveal
    await verificationBounty
      .connect(user1)
      .revealVote(1, VerificationResult.True, nonce);

    // After reveal period ends, no further reveals
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(
      verificationBounty
        .connect(user1)
        .revealVote(1, VerificationResult.True, nonce)
    ).to.be.revertedWith("Reveal period ended");
  });

  it("Requires evidence before starting voting", async function () {
    // Create bounty without evidence
    await verificationBounty
      .connect(owner)
      .createBounty("Claim B", "No evidence yet", REWARD);

    await expect(
      verificationBounty.connect(owner).startVoting(1)
    ).to.be.revertedWith("No evidence submitted");
  });
});
