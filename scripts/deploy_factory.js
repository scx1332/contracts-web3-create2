// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const provider = signer.provider;
    const pubAddr = signer.address;

    let balance = await provider.getBalance(pubAddr);
    console.log(`Using account ${pubAddr} Account balance: ${balance}`);

    if (balance.eq(0)) {
        console.log("Account balance is 0. Exiting.");
        return;
    }
    const erc20Factory = await hre.ethers.getContractFactory("ERC20");
    const erc20Contract = await erc20Factory.deploy(pubAddr);
    await erc20Contract.deployed();
    let glm_token = erc20Contract.address;
    console.log("GLM ERC20 test token deployed to:", glm_token);

    const cf = await hre.ethers.getContractFactory("MultiTransferERC20");

    const contractFactory = await cf.deploy(glm_token);
    await contractFactory.deployed();
    console.log("MultiTransferERC20 deployed to:", contractFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
