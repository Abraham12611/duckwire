const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DuckStaking", function () {
  let duckToken, duckStaking;
  let owner, user1, user2, slasher;

  beforeEach(async function () {
    [owner, user1, user2, slasher] = await ethers.getSigners();

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

    // Grant slasher role
    const SLASHER_ROLE = await duckStaking.SLASHER_ROLE();
    await duckStaking.grantRole(SLASHER_ROLE, slasher.address);

    // Transfer tokens to users for testing
    await duckToken.transfer(user1.address, ethers.parseEther("10000"));
    await duckToken.transfer(user2.address, ethers.parseEther("10000"));

    // Approve staking contract
    await duckToken.connect(user1).approve(duckStaking.target, ethers.parseEther("10000"));
    await duckToken.connect(user2).approve(duckStaking.target, ethers.parseEther("10000"));
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      await duckStaking.connect(user1).stake(stakeAmount);
      
      const stakeInfo = await duckStaking.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.reputation).to.equal(500); // Initial reputation
      expect(await duckStaking.isStaker(user1.address)).to.be.true;
    });

    it("Should reject stakes below minimum", async function () {
      const stakeAmount = ethers.parseEther("10"); // Below 20 DUCK minimum
      
      await expect(
        duckStaking.connect(user1).stake(stakeAmount)
      ).to.be.revertedWith("Amount below minimum stake");
    });

    it("Should update total staked amount", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      await duckStaking.connect(user1).stake(stakeAmount);
      await duckStaking.connect(user2).stake(stakeAmount);
      
      expect(await duckStaking.totalStaked()).to.equal(stakeAmount * 2n);
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await duckStaking.connect(user1).stake(ethers.parseEther("100"));
    });

    it("Should allow withdrawal request", async function () {
      const withdrawAmount = ethers.parseEther("50");
      
      await duckStaking.connect(user1).requestWithdrawal(withdrawAmount);
      
      const stakeInfo = await duckStaking.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(ethers.parseEther("50"));
      expect(stakeInfo.pendingWithdrawal).to.equal(withdrawAmount);
    });

    it("Should enforce withdrawal delay", async function () {
      const withdrawAmount = ethers.parseEther("50");
      
      await duckStaking.connect(user1).requestWithdrawal(withdrawAmount);
      
      await expect(
        duckStaking.connect(user1).withdraw()
      ).to.be.revertedWith("Withdrawal delay not met");
    });

    it("Should complete withdrawal after delay", async function () {
      const withdrawAmount = ethers.parseEther("50");
      
      await duckStaking.connect(user1).requestWithdrawal(withdrawAmount);
      
      // Fast forward time by 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const balanceBefore = await duckToken.balanceOf(user1.address);
      await duckStaking.connect(user1).withdraw();
      const balanceAfter = await duckToken.balanceOf(user1.address);
      
      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
    });

    it("Should enforce minimum stake after withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("90"); // Would leave 10 DUCK, below minimum
      
      await expect(
        duckStaking.connect(user1).requestWithdrawal(withdrawAmount)
      ).to.be.revertedWith("Remaining stake below minimum");
    });
  });

  describe("Slashing", function () {
    beforeEach(async function () {
      await duckStaking.connect(user1).stake(ethers.parseEther("100"));
    });

    it("Should allow slasher to slash stakers", async function () {
      const slashAmount = ethers.parseEther("30");
      
      await duckStaking.connect(slasher).slash(user1.address, slashAmount, "Dishonest behavior");
      
      const stakeInfo = await duckStaking.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(ethers.parseEther("70"));
      expect(stakeInfo.isSlashed).to.be.true;
      expect(stakeInfo.reputation).to.equal(250); // Halved from 500
    });

    it("Should prevent slashed users from withdrawing", async function () {
      await duckStaking.connect(slasher).slash(user1.address, ethers.parseEther("30"), "Test");
      
      await expect(
        duckStaking.connect(user1).requestWithdrawal(ethers.parseEther("20"))
      ).to.be.revertedWith("Cannot withdraw while slashed");
    });
  });

  describe("Reputation", function () {
    beforeEach(async function () {
      await duckStaking.connect(user1).stake(ethers.parseEther("100"));
      
      const REPUTATION_MANAGER_ROLE = await duckStaking.REPUTATION_MANAGER_ROLE();
      await duckStaking.grantRole(REPUTATION_MANAGER_ROLE, owner.address);
    });

    it("Should increase reputation for correct verifications", async function () {
      await duckStaking.updateReputation(user1.address, true);
      
      const stakeInfo = await duckStaking.getStakeInfo(user1.address);
      expect(stakeInfo.reputation).to.equal(510); // 500 + 10
      expect(stakeInfo.correctVerifications).to.equal(1);
      expect(stakeInfo.totalVerifications).to.equal(1);
    });

    it("Should decrease reputation for incorrect verifications", async function () {
      await duckStaking.updateReputation(user1.address, false);
      
      const stakeInfo = await duckStaking.getStakeInfo(user1.address);
      expect(stakeInfo.reputation).to.equal(495); // 500 - 5
      expect(stakeInfo.correctVerifications).to.equal(0);
      expect(stakeInfo.totalVerifications).to.equal(1);
    });

    it("Should calculate accuracy rate correctly", async function () {
      await duckStaking.updateReputation(user1.address, true);
      await duckStaking.updateReputation(user1.address, true);
      await duckStaking.updateReputation(user1.address, false);
      
      const accuracyRate = await duckStaking.getAccuracyRate(user1.address);
      expect(accuracyRate).to.equal(66); // 2/3 * 100 = 66%
    });
  });

  describe("Voting Weight", function () {
    beforeEach(async function () {
      await duckStaking.connect(user1).stake(ethers.parseEther("100"));
    });

    it("Should calculate voting weight correctly", async function () {
      const weight = await duckStaking.calculateVotingWeight(user1.address, 0);
      expect(weight).to.be.gt(0);
    });

    it("Should return zero weight for slashed users", async function () {
      await duckStaking.connect(slasher).slash(user1.address, ethers.parseEther("30"), "Test");
      
      const weight = await duckStaking.calculateVotingWeight(user1.address, 0);
      expect(weight).to.equal(0);
    });

    it("Should return zero weight for users below minimum stake", async function () {
      await duckStaking.connect(user1).requestWithdrawal(ethers.parseEther("85"));
      
      const weight = await duckStaking.calculateVotingWeight(user1.address, 0);
      expect(weight).to.equal(0);
    });
  });

  describe("Utility Functions", function () {
    beforeEach(async function () {
      await duckStaking.connect(user1).stake(ethers.parseEther("100"));
      await duckStaking.connect(user2).stake(ethers.parseEther("200"));
    });

    it("Should return all stakers", async function () {
      const stakers = await duckStaking.getAllStakers();
      expect(stakers).to.include(user1.address);
      expect(stakers).to.include(user2.address);
      expect(stakers.length).to.equal(2);
    });

    it("Should remove staker from list after full withdrawal", async function () {
      await duckStaking.connect(user1).requestWithdrawal(ethers.parseEther("100"));
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await duckStaking.connect(user1).withdraw();
      
      expect(await duckStaking.isStaker(user1.address)).to.be.false;
    });
  });
});
