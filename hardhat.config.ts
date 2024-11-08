import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HttpNetworkAccountsUserConfig } from "hardhat/types";
import "dotenv/config";

const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY: ENV_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  ALCHEMY_KEY,
} = process.env;

const PRIVATE_KEY =
  ENV_PRIVATE_KEY ??
  "0000000000000000000000000000000000000000000000000000000000000001"; // default key

const accounts: HttpNetworkAccountsUserConfig | undefined = [PRIVATE_KEY];
if (accounts == null) {
  console.warn(
    "Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example."
  );
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 19580000,
        enabled: false,
      },
    },
    sepolia: {
      url: SEPOLIA_RPC_URL as string,
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY as string,
    },
  },
};

export default config;
