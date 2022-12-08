require('dotenv').config({path:__dirname+'.env'})

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "dev",
    networks: {
        dev: {
            url: "http://127.0.0.1:8545",
            accounts: ["0xee565091929f51d02c504f4c37ecc79abd5caa7a67c8917d862d4393c8992519"],
            glmToken: "0x0B220b82F3eA3B7F6d9A1D8ab58930C064A2b5Bf",
            contractPrefix: "0x111",
            contractFactory: "0x1469e7B8B7B16110c76ED029DcB2DD0B10D47c6A",
            chainId: 77
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
