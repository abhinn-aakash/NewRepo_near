import { action, observable } from "mobx";

export class UIStore {
  @observable public pageLoading = false;
  @observable public dialogOpen = false;

  @action
  public setPageLoader(flag: boolean): void {
    this.pageLoading = flag;
  }

  @action
  public setDialogState(flag: boolean): void {
    this.dialogOpen = flag;
  }
}
