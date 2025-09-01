const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DuckToken", function () {
  let duckToken;
  let owner, minter, user1, user2;

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const DuckToken = await ethers.getContractFactory("DuckToken");
    duckToken = await DuckToken.deploy(
      "DuckWire Token",
      "DUCK",
      owner.address,
      ethers.parseEther("1000000") // 1M initial supply
    );
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await duckToken.name()).to.equal("DuckWire Token");
      expect(await duckToken.symbol()).to.equal("DUCK");
    });

    it("Should assign initial supply to owner", async function () {
      const ownerBalance = await duckToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("1000000"));
    });

    it("Should grant roles to owner", async function () {
      const DEFAULT_ADMIN_ROLE = await duckToken.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await duckToken.MINTER_ROLE();
      const PAUSER_ROLE = await duckToken.PAUSER_ROLE();

      expect(await duckToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await duckToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await duckToken.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const MINTER_ROLE = await duckToken.MINTER_ROLE();
      await duckToken.grantRole(MINTER_ROLE, minter.address);

      await duckToken.connect(minter).mint(user1.address, ethers.parseEther("1000"));
      expect(await duckToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should not allow non-minter to mint", async function () {
      await expect(
        duckToken.connect(user1).mint(user2.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await duckToken.MAX_SUPPLY();
      const currentSupply = await duckToken.totalSupply();
      const remainingSupply = maxSupply - currentSupply;

      await expect(
        duckToken.mint(user1.address, remainingSupply + ethers.parseEther("1"))
      ).to.be.revertedWith("Exceeds maximum supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await duckToken.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their own tokens", async function () {
      await duckToken.connect(user1).burn(ethers.parseEther("500"));
      expect(await duckToken.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
    });

    it("Should allow burner role to burn from any address", async function () {
      const BURNER_ROLE = await duckToken.BURNER_ROLE();
      await duckToken.grantRole(BURNER_ROLE, owner.address);

      await duckToken.burnFrom(user1.address, ethers.parseEther("300"));
      expect(await duckToken.balanceOf(user1.address)).to.equal(ethers.parseEther("700"));
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause transfers", async function () {
      await duckToken.pause();
      
      await expect(
        duckToken.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow pauser to unpause transfers", async function () {
      await duckToken.pause();
      await duckToken.unpause();
      
      await duckToken.transfer(user1.address, ethers.parseEther("100"));
      expect(await duckToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Governance", function () {
    it("Should track voting power correctly", async function () {
      await duckToken.transfer(user1.address, ethers.parseEther("1000"));
      
      // Delegate to self to activate voting power
      await duckToken.connect(user1).delegate(user1.address);
      
      expect(await duckToken.getVotes(user1.address)).to.equal(ethers.parseEther("1000"));
    });
  });
});
