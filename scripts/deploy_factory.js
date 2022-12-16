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
    const BIG_18 = hre.ethers.BigNumber.from("1000000000000000000");
    const erc20Contract = await erc20Factory.deploy(pubAddr, BIG_18.mul(1000000000));
    await erc20Contract.deployed();
    let glm_token = erc20Contract.address;
    console.log("GLM ERC20 test token deployed to:", glm_token);

    const cf = await hre.ethers.getContractFactory("MultiTransferERC20");

    const multiTransfer = await cf.deploy(glm_token);
    await multiTransfer.deployed();
    console.log("MultiTransferERC20 deployed to:", multiTransfer.address);

    const res = await erc20Contract.approve(multiTransfer.address, BIG_18.mul(1000000000));
    const receipt = await res.wait();
    console.log("Approve result: ", receipt.status);

    let addr_list = ["0x001066290077e38f222cc6009c0c7a91d5192303"
        , "0x00203654961340f35726ce63eb4bf6912a62022e"
        , "0x003047f2f6b0c66a07e60f149276211dc2ff7489"
        , "0x0040bcefcb706641104a9feb95ad59830c30671b"
        , "0x005014c6eea59620aea92298f8af003bed130ad0"
        , "0x0060967f2181b0e496b1a1a0389b9c2f3d8dc2a9"
        , "0x0070619c46c4b2738c0ce73d63bbe061391fd80f"
        , "0x0080dc12044e18c8f53c7ccced0ef776d4b3bfd8"
        , "0x0090167b580b0b3c79e24f6b919762b9e5cf0a05"
        , "0x0100652743be2dc18637c05bf5e49cfc87f30243"];
    let amounts = [];
    for (let addr in addr_list) {
        amounts.push(BIG_18.mul(1000000));
    }

    let tx = await multiTransfer.golemTransferDirect(addr_list, amounts);
    let tx_receipt = await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
