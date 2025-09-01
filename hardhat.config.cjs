require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    "duckchain-mainnet": {
      url: process.env.DUCKCHAIN_MAINNET_RPC || "https://rpc.duckchain.io",
      chainId: 5545,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "duckchain-testnet": {
      url: process.env.DUCKCHAIN_TESTNET_RPC || "https://testnet-rpc.duckchain.io",
      chainId: 202105,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "duckchain-mainnet": process.env.DUCKCHAIN_API_KEY || "placeholder",
      "duckchain-testnet": process.env.DUCKCHAIN_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "duckchain-mainnet",
        chainId: 5545,
        urls: {
          apiURL: "https://scan.duckchain.io/api",
          browserURL: "https://scan.duckchain.io",
        },
      },
      {
        network: "duckchain-testnet",
        chainId: 202105,
        urls: {
          apiURL: "https://testnet-scan.duckchain.io/api",
          browserURL: "https://testnet-scan.duckchain.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
