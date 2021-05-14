import {
  connect,
  Contract,
  keyStores,
  WalletConnection,
  utils,
} from "near-api-js";
import { getConfig } from "./config";

const nearConfig = getConfig(process.env.NODE_ENV || "development");

// Initialize contract & set global variables
async function initContract(): Promise<any> {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  const walletConnection = new WalletConnection(near, null);
  window.walletConnection = walletConnection;

  // Getting the Account ID. If still unauthorized, it's just empty string
  const accountId = window.walletConnection.getAccountId();
  window.accountId = accountId;

  // Initializing our contract APIs by contract name and configuration
  const contract = new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "balanceOf",
        "deltaOf",
        "getStream",
        "getEarnings",
        "getSpent",
        "getStreamsByAccountId",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ["createStream", "cancelStream", "withdrawFromStream"],
    }
  );
  window.contract = contract;

  const account = await near.account(contract.account?.accountId);
  window.account = account;

  return { contract, nearConfig, walletConnection, account };
}

export async function login(): Promise<void> {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  const resp = await window.walletConnection.requestSignIn(
    window.contract.contractId,
    "Xeggo"
  );
  return;
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  //   window.location.replace(window.location.origin + window.location.pathname);
}

export const NearService = {
  initContract,
  login,
  logout,
};
