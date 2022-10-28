// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers} = require("hardhat");
const fs = require('fs').promises;


async function getContractFactoryAbi() {
    const contractName = "ContractFactory"
    let compiledContract = await fs.readFile(`artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const contract = JSON.parse(compiledContract);
    return contract.abi;
}

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
    let byteCodeSha = ethers.utils.keccak256(byteCode);
    let data = ['ff', creatorAddress, saltHex, byteCodeSha].map(x => x.replace('0x', '')).join('');
    let contractAddr = ethers.utils.keccak256(`0x${data}`).slice(-40);
    return `0x${contractAddr}`;
}

function encodeParam(dataType, data) {
    const provider = new ethers.providers.JsonRpcProvider();

    return web3.eth.abi.encodeParameter(dataType, data)
}

async function main() {
    let config = hre.network.config;
    if (process.env.CONTRACT_FACTORY == undefined) {
        console.log("Deploy contract factory first and set CONTRACT_FACTORY address in .env file");
        return;
    }
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const provider = signer.provider;
    const pubAddr = signer.address;

    let balance = await provider.getBalance(pubAddr);
    console.log(`Using account ${pubAddr} Account balance: ${balance}`);

    //load MultiTransferERC20.json
    const contractName = "MultiTransferERC20"
    let compiledContract = await fs.readFile(`artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const contract = JSON.parse(compiledContract);
    const abi = contract.abi;
    const contractBytecode = contract.bytecode;

    //console.log("ABI:", abi);
    //console.log("Bytecode:", bytecode);
    let constructorParams = encodeParam('address', config.glmToken).slice(2);
    console.log("Constructor params:", constructorParams);
    const bytecode = `${contractBytecode}${constructorParams}`


    const factoryAddress = process.env.CONTRACT_FACTORY;


    let saltNum = BigInt(234567890);
    let saltStr = "";
    let contractAddr = "";
    console.log("Searching for contract address...");
    while (true) {
        saltStr = "0x" + saltNum.toString(16).padStart(32, '0');
        console.log(saltStr);
        contractAddr = buildCreate2Address(factoryAddress, saltStr, bytecode);
        if (contractAddr.startsWith(config.contractPrefix)){
            console.log(`Computed address: ${contractAddr} with salt: ${saltStr}`);
            break;
        }
        saltNum += BigInt(1);
    }
    let deployer = new ethers.Contract(factoryAddress, await getContractFactoryAbi(), signer);
    let tx = await deployer.deploy(bytecode, saltStr);

    console.log(`Contract deployed to address: ${contractAddr}. Tx id: ${tx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
