export class StremeFormModel {
  tokenType: string;
  receiverAddress: string;
  amount: string;
  frequency: string;
  startDate: number;
  stopDate: number;

  constructor(data?: Partial<StremeFormModel>) {
    this.tokenType = data?.tokenType || "n1";
    this.receiverAddress = data?.receiverAddress || "";
    this.amount = data?.amount || "";
    this.frequency = data?.frequency || "";
    this.startDate = data?.startDate || null;
    this.stopDate = data?.stopDate || null;
  }
}
