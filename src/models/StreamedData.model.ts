import moment from "moment";

export class StreamedDataModel {
  streamId: number;
  deposit: number;
  frequency: number;
  isEntity: boolean;
  status: string;
  lastClaimedOn: number;
  ratePerFrequency: number;
  recipient: string;
  remainingBalance: number;
  sender: string;
  startTime: number;
  stopTime: number;
  startDate: string;
  stopDate: string;
  balanceSent: number;

  constructor(data?: Partial<StreamedDataModel>) {
    this.streamId = data?.streamId || 0;
    this.deposit = data?.deposit || 0;
    this.frequency = data?.frequency || 0;
    this.isEntity = data?.isEntity || false;
    this.status = data?.status || "";
    this.lastClaimedOn = data?.lastClaimedOn || 0;
    this.ratePerFrequency = data?.ratePerFrequency || 0;
    this.recipient = data?.recipient || "";
    this.remainingBalance = data?.remainingBalance || 0;
    this.sender = data?.sender || "";
    this.startTime = data?.startTime || null;
    this.stopTime = data?.stopTime || null;
    this.startDate = data?.startDate || "";
    this.stopDate = data?.stopDate || "";
    this.balanceSent = data?.balanceSent || 0;
  }

  static deserialize(apiData: Partial<StreamedDataModel>): StreamedDataModel {
    if (!apiData) {
      return new StreamedDataModel();
    }
    const balanceSent =
      100 - (apiData.remainingBalance * 100) / apiData.deposit;
    const data: Partial<StreamedDataModel> = {
      ...apiData,
      status: apiData.isEntity ? "Active" : "Inactive",
      startDate: moment(apiData.startTime).format("YYYY-MM-DD").toString(),
      stopDate: moment(apiData.stopTime).format("YYYY-MM-DD").toString(),
      balanceSent,
    };
    return new StreamedDataModel(data);
  }

  static deserializeList(
    apiDataList: Partial<StreamedDataModel>[]
  ): StreamedDataModel[] {
    return apiDataList
      ? apiDataList.map((apiData: Partial<StreamedDataModel>) =>
          StreamedDataModel.deserialize(apiData)
        )
      : [];
  }
}
