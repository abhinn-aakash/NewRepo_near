import { action, observable } from "mobx";
import { Contract, utils } from "near-api-js";
import { StreamedDataModel } from "../models";

export class DataStore {
  @observable totalEarnings = "";
  @observable totalSpent = "";
  @observable ledgerData = [];
  @observable totalAmount = 0;

  public initStore(contract: Contract) {
    this.getEarnings(contract);
    this.getSpent(contract);
  }

  @action getEarnings(totalEarnings: string) {
    this.totalEarnings = totalEarnings;
  }

  @action getSpent(totalSpent: string) {
    this.totalSpent = totalSpent;
  }

  @action getTotalAmount(totalAmount) {
    this.totalAmount = Number(
      utils.format.formatNearAmount(totalAmount)
    ).toFixed(2);
  }

  @action async getLedgerData(ledgerData: Partial<StreamedDataModel>[]) {
    this.ledgerData = StreamedDataModel.deserializeList(ledgerData);
  }
}
