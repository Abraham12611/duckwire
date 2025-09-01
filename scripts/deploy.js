const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy DuckToken
  console.log("\n=== Deploying DuckToken ===");
  const DuckToken = await ethers.getContractFactory("DuckToken");
  const duckToken = await DuckToken.deploy(
    "DuckWire Token",
    "DUCK",
    deployer.address,
    ethers.parseEther("100000000") // 100M initial supply
  );
  
  await duckToken.waitForDeployment();
  console.log("DuckToken deployed to:", await duckToken.getAddress());

  // Deploy DuckStaking
  console.log("\n=== Deploying DuckStaking ===");
  const DuckStaking = await ethers.getContractFactory("DuckStaking");
  const duckStaking = await DuckStaking.deploy(
    await duckToken.getAddress(),
    deployer.address
  );
  
  await duckStaking.waitForDeployment();
  console.log("DuckStaking deployed to:", await duckStaking.getAddress());

  // Deploy VerificationBounty
  console.log("\n=== Deploying VerificationBounty ===");
  const VerificationBounty = await ethers.getContractFactory("VerificationBounty");
  const verificationBounty = await VerificationBounty.deploy(
    await duckToken.getAddress(),
    await duckStaking.getAddress(),
    deployer.address
  );
  
  await verificationBounty.waitForDeployment();
  console.log("VerificationBounty deployed to:", await verificationBounty.getAddress());

  // Grant necessary roles
  console.log("\n=== Setting up roles and permissions ===");
  
  // Grant MINTER_ROLE to staking contract for rewards
  const MINTER_ROLE = await duckToken.MINTER_ROLE();
  await duckToken.grantRole(MINTER_ROLE, await duckStaking.getAddress());
  console.log("Granted MINTER_ROLE to DuckStaking contract");

  // Grant REPUTATION_MANAGER_ROLE to bounty contract
  const REPUTATION_MANAGER_ROLE = await duckStaking.REPUTATION_MANAGER_ROLE();
  await duckStaking.grantRole(REPUTATION_MANAGER_ROLE, await verificationBounty.getAddress());
  console.log("Granted REPUTATION_MANAGER_ROLE to VerificationBounty contract");

  // Grant BOUNTY_CREATOR_ROLE to deployer (can be changed later)
  const BOUNTY_CREATOR_ROLE = await verificationBounty.BOUNTY_CREATOR_ROLE();
  await verificationBounty.grantRole(BOUNTY_CREATOR_ROLE, deployer.address);
  console.log("Granted BOUNTY_CREATOR_ROLE to deployer");

  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      DuckToken: await duckToken.getAddress(),
      DuckStaking: await duckStaking.getAddress(),
      VerificationBounty: await verificationBounty.getAddress()
    },
    deployedAt: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts on DuckChain explorer (if API key is available)
  if (process.env.DUCKCHAIN_API_KEY) {
    console.log("\n=== Verifying contracts ===");
    try {
      await hre.run("verify:verify", {
        address: await duckToken.getAddress(),
        constructorArguments: [
          "DuckWire Token",
          "DUCK",
          deployer.address,
          ethers.parseEther("100000000")
        ],
      });
      console.log("DuckToken verified");

      await hre.run("verify:verify", {
        address: await duckStaking.getAddress(),
        constructorArguments: [
          await duckToken.getAddress(),
          deployer.address
        ],
      });
      console.log("DuckStaking verified");

      await hre.run("verify:verify", {
        address: await verificationBounty.getAddress(),
        constructorArguments: [
          await duckToken.getAddress(),
          await duckStaking.getAddress(),
          deployer.address
        ],
      });
      console.log("VerificationBounty verified");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  return deploymentInfo;
}

main()
  .then((deploymentInfo) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
