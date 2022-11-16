import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});

const PRIVATE_KEY: string = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",

    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        hardhat: {
            forking: {
                url: "https://eth-mainnet.g.alchemy.com/v2/ItpxQ-mxhCcBqRxuoG84tY1YfUlmpgPa",
            }
        },
        testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            gasPrice: 20000000000,
            gas: 2100000,
            accounts: [PRIVATE_KEY]
        },
        mainnet: {
            url: "https://bsc-dataseed.binance.org/",
            chainId: 56,
            gasPrice: 20000000000,
            accounts: [PRIVATE_KEY]
        }
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