const ethers = require('ethers');
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const block = require("chains.web3");

const CONTRACT_ABI = require("./contractABI.json");


// Connect to your Ethereum node
const provider = new ethers.providers.JsonRpcProvider(process.env.HTTP_RPC);

// You'll need to replace this with your actual private key
const privateKey = process.env.WALLET_KEY;
const signer = new ethers.Wallet(privateKey, provider);

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Function to read time from contract
async function readContractTime() {
  try {
    const result = await contract.currRoundStartTime();
    return result.toNumber();
  } catch (error) {
    console.error('Error reading contract time:', error);
    return null;
  }
}

// Function to call write function
async function callWriteFunction() {
  try {
   const tx = await contract.closeRound();
    await tx.wait();
    console.log('Write function called successfully');
  } catch (error) {
    console.error('Error calling write function:', error);
  }
}
// block()

function calculateHoursPassed(timestampA, timestampB) {
    // Calculate the difference in seconds
    const diffInSeconds = timestampB - timestampA;
    
    // Convert seconds to hours
    const diffInHours = diffInSeconds / 3600;
    
    // Return the result rounded to 2 decimal places
    return Math.round(diffInHours * 100) / 100;
  }
  
  // Your timestamps
  const a = 1722005649;
  const b = 1722014226;
  
  // Calculate and log the result
  const hoursPassed = calculateHoursPassed(a, b);
  console.log(`Hours passed: ${hoursPassed}`);

// Main bot logic
async function runBot() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60; // 24 hours in seconds
  let lastCheckedTime = await readContractTime();

  while (true) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    
    if (currentTime === null) {
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute before retrying
      continue;
    }

    if (currentTime > TWENTY_FOUR_HOURS + lastCheckedTime) {
      console.log('Time has increased by more than 24 hours. Calling write function...');
      await callWriteFunction();
      lastCheckedTime = currentTime;
    } else {
      console.log(`Current time: ${currentTime} seconds. Last checked time: ${lastCheckedTime} seconds. Waiting...`);
      const hoursPassed = calculateHoursPassed(lastCheckedTime, currentTime);
console.log(`Hours passed: ${hoursPassed} hr`);
    }


   // Wait for 1 minute before checking again
await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

// Start the bot
runBot();