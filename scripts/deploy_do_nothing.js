// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

function formatToGwei(wei) {
  if (wei > 100000000000) {
    return `${Math.round(wei / 1000000000)} Gwei`;
  }
  if (wei > 10000000000) {
    return `${Math.round(wei / 100000000) / 10} Gwei`;
  }
  if (wei > 10000000) {
    return `${Math.round(wei / 10000000) / 100} Gwei`;
  }
  return `${wei} wei`;
}

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

  const BLOCK_GAS_LIMIT = 30000000;
  const BLOCK_GAS_AVG = BLOCK_GAS_LIMIT / 2;
  const BLOCK_GAS_MAX_TX = BLOCK_GAS_LIMIT - 200000;
  const BLOCK_GAS_CHANGE = 0.125;
  const AVERAGE_BLOCK_TIME = 5;

  let targetGasPrice = 1 * 1000000000;

  let lastCheckDate = new Date();
  let lastTargetChange = 0;
  while (true) {
    //check time from lastCheckDate
    let now = new Date();
    if (now - lastTargetChange > 1000 * 60 * 5) {
      targetGasPrice = 1000000000 + Math.random() * 1000 * 1000000000;
      lastTargetChange = now;
    }
    if (now - lastCheckDate > 1000) {
      lastCheckDate = now;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000 - (now - lastCheckDate)));
      lastCheckDate = new Date();
    }
    try {
      let block = await provider.getBlock("latest");
      let currentGasPrice = block.baseFeePerGas.toNumber();
      let gasPriceNextBlock = Math.round((1.0 + (block.gasUsed.toNumber() - BLOCK_GAS_AVG) / BLOCK_GAS_AVG * BLOCK_GAS_CHANGE) * currentGasPrice);

      console.log(`Gas price: current block: ${formatToGwei(currentGasPrice)} next block: ${formatToGwei(gasPriceNextBlock)} target: ${formatToGwei(targetGasPrice)}`);

      let currentNonce = await provider.getTransactionCount(pubAddr);
      let pendingNonce = await provider.getTransactionCount(pubAddr, "pending");
      if (pendingNonce - currentNonce > 0) {
        console.log(`Too many pending transactions: ${pendingNonce - currentNonce}.`);
        continue;
      }
      let percentChange = gasPriceNextBlock / targetGasPrice;
      if (percentChange > 1.0 + BLOCK_GAS_CHANGE) {
        console.log(`Current gas price is higher than target. Waiting.`);
        let base = 1.0 + BLOCK_GAS_CHANGE;
        let iters = 0;
        while (base < percentChange) {
          base = base * (1.0 + BLOCK_GAS_CHANGE);
          iters++;
        }
        if (iters > 2) {
          iters = iters - 2;
          console.log(`Waiting ${iters * AVERAGE_BLOCK_TIME} seconds.`);
          await new Promise((resolve) => setTimeout(resolve, iters * AVERAGE_BLOCK_TIME * 1000));
        }
        continue;
      }

      let targetGas = BLOCK_GAS_AVG + ((1 - percentChange) / BLOCK_GAS_CHANGE * BLOCK_GAS_AVG);
      targetGas = Math.floor(Math.max(100000, Math.min(targetGas, BLOCK_GAS_MAX_TX)));
      const loops = Math.max(1, Math.floor((targetGas - 22500) / 207));
      let transactionGasPrice = Math.round((1 + BLOCK_GAS_CHANGE) * targetGasPrice + 1100000000);
      console.log("Gas price", transactionGasPrice);
      await dncFactory.costlyTransaction(loops, 0, {
        gasPrice: transactionGasPrice,
        gasLimit: targetGas + 90000
      });
      console.log(`Costly transaction sent: Gas: ${targetGas}, loops: ${loops}`);
    }
    catch (e) {
      console.error(e);
    }
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
