/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGON_SCAN_API_KEY = process.env.POLYGON_SCAN_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 31337
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    filecoinCalibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [PRIVATE_KEY]
    },
    filecoinMainnet: {
      url: "https://api.node.glif.io",
      accounts: [PRIVATE_KEY]
    },
    // U2U networks
    seiTestnet: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      accounts: [PRIVATE_KEY],
      chainId: 1328
    },
    seiDevnet:{
      url: "https://evm-rpc.arctic-1.seinetwork.io",
      accounts: [PRIVATE_KEY],
      chainId: 713715
    },
    seiMainnet: {
      url: "https://evm-rpc.sei-apis.com", 
      accounts: [PRIVATE_KEY],
      chainId: 1329
    },
    baseSepolia:{
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532
    },
    // U2U networks
    u2uTestnet: {
      url: "https://rpc-nebulas-testnet.u2u.xyz",
      accounts: [PRIVATE_KEY],
      chainId: 2484
    },
    u2uMainnet: {
      url: "https://rpc-mainnet.u2u.xyz",
      accounts: [PRIVATE_KEY],
      chainId: 39
    }
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygonMumbai: POLYGON_SCAN_API_KEY,
      polygon: POLYGON_SCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
