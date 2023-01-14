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

  //22842 - one loop
  //20722659 - 100000 loops
  //207 per loop
  const targetGas = 29000000;


  let targetGasPrice = 100

  let lastCheckDate = new Date();
  while (true) {
    //check time from lastCheckDate
    let now = new Date();
    let diff = now - lastCheckDate;
    if (diff > 1000) {
      console.log(diff);
      lastCheckDate = now;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000-diff));

    }

    let block = await provider.getBlock("latest");
    let currentGasPrice = block.baseFeePerGas.toNumber();
    block.gasUsed.toNumber() - 15000000;

    let currentNonce = await provider.getTransactionCount(pubAddr);
    let pendingNonce = await provider.getTransactionCount(pubAddr, "pending");
    console.log(`Pending nonce: ${pendingNonce} Current nonce: ${currentNonce}`);

    console.log(`Current gas price: ${currentGasPrice} Target gas price: ${targetGasPrice}`);


    if (pendingNonce - currentNonce > 1) {
      console.log(`Too many pending transactions: ${currentNonce - pendingNonce}. Waiting.`);
      continue;
    }
    let percentChange = currentGasPrice / targetGasPrice;
    let tg = 29000000;
    if (percentChange < 0.9) {
      tg = 29000000
    } else if (percentChange > 0.9 && percentChange < 1.0) {
      let multiplier = (1 - percentChange) / (1 - 0.9);

      tg = 15000000 + (multiplier * 15000000);
    } else {
      console.log(`Current gas price is higher than target. Waiting.`);
      continue;
    }
    const targetGas = Math.floor(Math.max(100000, Math.min(tg, 29000000)));
    const loops = Math.max(1, Math.floor((targetGas - 22500) / 207));
    //const gasEstimated = await dncFactory.estimateGas.costlyTransaction(loops, 0);
    //console.log(`Estimated gas: ${gasEstimated.toString()} vs target ${targetGas}`);

    const res = await dncFactory.costlyTransaction(loops, 0, {
      gasPrice: targetGasPrice + 1100000000,
      gasLimit: targetGas + 90000,
    });
    console.log(`Costly transaction sent ${targetGas}`);
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
