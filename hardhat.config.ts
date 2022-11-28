import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",

    networks: {
        hardhat: {
            forking: {
                url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_PROVIDER}`,
            }
        },
        polygon: {
            url: "https://polygon-rpc.com/",
            chainId: 137,
            accounts: [process.env.PRIVATE_KEY],
        },
        mumbai: {
            url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
            chainId: 80001,
            accounts: [process.env.PRIVATE_KEY],
        }
    },
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            }
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    mocha: {
        timeout: 20000
    }
};

export default config;