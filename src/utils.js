import { connect, Contract, keyStores, WalletConnection, utils } from 'near-api-js'
import getConfig from './config'
import moment from "moment";

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['get_events', 'get_event', 'get_attendess', 'check_access', 'get_token_owner', 'check_attendee', 'check_check_in'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['factory', 'purchase', 'check_in', 'grant_access', 'revoke_access', 'transfer_from', 'transfer', 'burn', 'mint'],
  })

  return { contract, nearConfig, walletConnection };
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export const parseNearAmount = (amount) => {
  return utils.format.formatNearAmount(amount)
}

export const fromNear2Yocto = utils.format.parseNearAmount

export function humanReadableDate(timestamp) {
  return moment.unix(timestamp).fromNow();
}

export const createStream = async (recipient, deposit, startTime, stopTime) => {
  const response = await window.contract.createStream({ recipient, deposit, startTime, stopTime }); //startTime and stopTime in unix timestamp format
  return response;
}

export const getStream = async (streamId) => {
  const response = await window.contract.getStream({ streamId });
  return response;
}

export const balanceOf = async (streamId, accountId) => {
  const response = await window.contract.balanceOf({ streamId, accountId });
  return response;
}

export const deltaOf = async (streamId) => {
  const response = await window.contract.deltaOf({ streamId });
  return response;
}

export const cancelStream = async (streamId) => {
  const response = await window.contract.cancelStream({ streamId });
  return response;
}

export const withdrawFromStream = async (streamId, amount) => {
  const response = await window.contract.withdrawFromStream({ streamId, amount });
  return response;
}

