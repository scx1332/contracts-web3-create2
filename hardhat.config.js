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
            glmToken: "0x303de46de694cc75a2f66da93ac86c6a6eee607e",
            contractPrefix: "0x777",
            chainId: 5
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
