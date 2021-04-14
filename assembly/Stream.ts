export class Stream {
    deposit: i32;
    ratePerSecond: i32;
    remainingBalance: i32;
    startTime: i32;
    stopTime: i32;
    recipient: string;
    sender: string;
    tokenAddress: string;
    isEntity: bool;

    constructor(deposit: i32, ratePerSecond: i32, remainingBalance: i32, startTime: i32, stopTime: i32, recipient: string, sender: string, tokenAddress: string, isEntity: bool) {
        this.deposit = deposit;
        this.ratePerSecond = ratePerSecond;
        this.remainingBalance = remainingBalance;
        this.startTime = startTime;
        this.stopTime = stopTime;
        this.recipient = recipient;
        this.sender = sender;
        this.tokenAddress = tokenAddress;
        this.isEntity = isEntity;
    }

}