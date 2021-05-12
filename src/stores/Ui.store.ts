import { action, observable } from "mobx";

export class UIStore {
  @observable public pageLoading = false;

  @action
  public setPageLoader(flag: boolean): void {
    this.pageLoading = flag;
  }
}
