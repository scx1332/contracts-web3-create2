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
  const dnc = await hre.ethers.getContractFactory("DoNothingContract");
  const dncFactory = await dnc.deploy();
  await dncFactory.deployed();
  console.log("DoNothingContract deployed to:", dncFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
