import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-dependency-compiler";
import "hardhat-deploy";

import "dotenv/config";

export default {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
        },
      },
    ],
  },
  networks: {
    tac_turin: {
      url: "https://newyork-inap-72-251-230-233.ankr.com/tac_tacd_testnet_full_rpc_1",
      chainId: 2390,
      accounts: [process.env.PRIVATE_KEY || ""],
      saveDeployments: true,
    },
    tac_mainnet: {
      url: `https://rpc.ankr.com/tac`,
      chainId: 239,
      accounts: [process.env.PRIVATE_KEY || ""],
      saveDeployments: true,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      tac_turin: process.env.TAC_TURIN_API_KEY || "test",
      tac_mainnet: process.env.TAC_MAINNET_API_KEY || "test",
    },
    customChains: [
      {
        network: "tac_turin",
        chainId: 2390,
      urls: {
          apiURL: "",
          browserURL: "https://explorer.tac-turin.ankr.com/",
        },
      },
      {
        network: "tac_mainnet",
        chainId: 239,
        urls: {
          apiURL: "https://explorer.tac.build/api",
          browserURL: "https://explorer.tac.build",
        },
      },
    ],
  },
  dependencyCompiler: {
    paths: [
      "@zerolendxyz/core-v3/contracts/dependencies/openzeppelin/upgradeability/InitializableAdminUpgradeabilityProxy.sol",
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};
