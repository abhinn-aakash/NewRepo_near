const getConfig = require('./config');

// Load environment variables
require("dotenv").config();

// Load NEAR Javascript API components
const near = require("near-api-js");

// Load near configuration

// const nearConfig = getConfig(process.env.NODE_ENV || 'testnet')

// Directory where NEAR credentials are going to be stored
const credentialsPath = "/home/phinelipy/work/official/NEAR Protocol/NewRepo_near/src/credentials/testnet/receiver1.test1232.testnet.json";
// Configure the keyStore to be used with the NEAR Javascript API
const UnencryptedFileSystemKeyStore = near.keyStores.UnencryptedFileSystemKeyStore;
const keyStore = new UnencryptedFileSystemKeyStore(credentialsPath)
console.log(keyStore);
// Setup default client options
const options = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  accountId: "receiver1.test1232.testnet",
  deps: {
    keyStore: keyStore
  }
}
async function main() {
  // Configure the client with options and our local key store
  const client = await near.connect(options);
  console.log("client: ", client);
  const account = await client.account(options.accountId);
  console.log("account: ", await account.getAccountDetails());
  // We'are using the same contract name, feel free to create a different one.
  const contractName = options.accountId;
  // Construct a new contract object, we'll be using it to perform calls
  const contract = new near.Contract(account, contractName, {
    viewMethods: ["getStream", "balanceOf",],   // our read function
    changeMethods: ["withdrawFromStream", "cancelStreamInternal", "createStream"], // our write function
    sender: options.accountId,   // account used to sign contract call transactions
  });
  console.log("contract: ", contract);
  // We will send the current date when calling `setValue`
  // const value = (new Date()).toString();

  console.log(`Calling contract call 'createStream'`);
  const streamId = await contract.createStream({ recipient: "test1232.testnet", deposit: 10, startTime: 1618423345, stopTime: 1621015325 });
  console.log("streamId: ", streamId);
  // Get the value we assigned
  console.log("Getting stream info");
  result = await contract.getStream(streamId);
  console.log("Result:", result);

  // Alternative way of calling a function
  result = await account.functionCall(
    contractName,
    "getStream",
    { streamId }
  );
  console.log(result);
};

main();