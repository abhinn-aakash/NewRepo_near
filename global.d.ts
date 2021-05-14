import { Contract, WalletConnection, Account } from "near-api-js";
export {};

interface CustomContract extends Contract {
  balanceOf?: Function;
  deltaOf?: Function;
  getStream?: Function;
  getEarnings?: Function;
  getSpent?: Function;
  getStreamsByAccountId?: Function;
  createStream?: Function;
  cancelStream?: Function;
  withdrawFromStream?: Function;
}

declare global {
  interface Window {
    walletConnection: WalletConnection;
    accountId: string;
    contract: CustomContract;
    account: Account;
  }
}
