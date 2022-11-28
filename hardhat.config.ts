import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});

const ALCHEMY_PROVIDER: string = process.env.ALCHEMY_PROVIDER;

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",

    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        hardhat: {
            forking: {
                url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER}`,
            }
        },
    },
    solidity: {
        version: "0.8.0",
        settings: {
            optimizer: {
                enabled: true
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