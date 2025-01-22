import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    tac_turin: {
      url: "https://newyork-inap-72-251-230-233.ankr.com/tac_tacd_testnet_full_rpc_1",
      chainId: 2390,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
  etherscan: {
    customChains: [
      {
        network: "tac_turin",
        chainId: 2390,
      urls: {
          apiURL: "",
          browserURL: "https://explorer.tac-turin.ankr.com/",
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;