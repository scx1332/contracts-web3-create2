require('dotenv').config({path:__dirname+'/.env'})

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "mumbai",
    networks: {
        mumbai: {
            url: process.env.MUMBAI_RPC,
            accounts: [process.env.PRIVATE_KEY],
            glmToken: "0x2036807b0b3aaf5b1858ee822d0e111fddac7018",
            contractPrefix: "0x11111",
            chainId: 80001
        },
        goerli: {
            url: process.env.GOERLI_RPC,
            accounts: [process.env.PRIVATE_KEY],
            glmToken: "0x33af15c79d64b85ba14aaffaa4577949104b22e8",
            contractPrefix: "0x77777",
            chainId: 5
        },
        polygon: {
            url: process.env.POLYGON_RPC,
            accounts: [process.env.PRIVATE_KEY],
            glmToken: "0x0B220b82F3eA3B7F6d9A1D8ab58930C064A2b5Bf",
            contractPrefix: "0x50100",
            chainId: 137
        }
    },
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000
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
        timeout: 40000
    }
};
