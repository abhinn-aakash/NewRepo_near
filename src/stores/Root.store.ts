import { DataStore } from "./Data.store";
import { UIStore } from "./Ui.store";

export class RootStore {
  public uiStore: UIStore;
  public dataStore: DataStore;

  constructor() {
    this.uiStore = new UIStore();
    this.dataStore = new DataStore();
  }
}
