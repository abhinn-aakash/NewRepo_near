import { Context, logging, PersistentMap } from "near-sdk-as";
import { PausableWithoutRenounce } from "./PausableWithoutRenounce";
import { nonReentrant } from "./ReentrancyGuard";
import { Stream } from "./Stream";
import { init, tokenBalanceOf, transfer, transferFrom } from "./token/ERC20/ERC20";

/**
 * @title Money Streaming
 * @author Dimple-Kanwar
 */

/**
 * @notice The stream objects identifiable by their unsigned integer ids.
 */
let streams = new PersistentMap<i32, Stream>("s:");

/**
 * @notice Counter for new stream ids.
 */
let nextStreamId: i32 = 0;

export function createStream(recipient: string, deposit: i32, tokenAddress: string, startTime: i32, stopTime: i32): i32 {
    new PausableWithoutRenounce().whenNotPaused();
    logging.log(recipient);
    logging.log(deposit);
    logging.log(tokenAddress);
    logging.log(startTime);
    logging.log(stopTime);
    logging.log(Context.contractName);
    logging.log(Context.sender);
    assert(recipient != "0x00", "stream to the zero address");
    assert(recipient != Context.contractName, "stream to the contract itself");
    assert(recipient != Context.sender, "stream to the caller");
    assert(deposit > 0, "deposit is zero");
    assert(startTime >= i32(Context.blockTimestamp), "start time before block.timestamp");
    assert(stopTime > startTime, "stop time before the start time");
    let duration = sub(stopTime, startTime);
    logging.log(duration);
    /* This condition avoids dealing with remainders */
    assert(deposit % duration == 0, "deposit not multiple of time delta");
    /* Create and store the stream object. */
    let streamId = nextStreamId;
    logging.log(streamId);
    logging.log(streams.getSome(streamId));
    let ratePerSecond = div(deposit, duration);
    logging.log(ratePerSecond);
    streams.set(streamId, new Stream(deposit, ratePerSecond, deposit, startTime, stopTime, recipient, Context.sender, tokenAddress, true));
    logging.log(streams.getSome(streamId));
    /* Increment the next stream id. */
    nextStreamId = add(nextStreamId, u32(1));
    logging.log(nextStreamId);
    // require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), deposit), "token transfer failure");
    logging.log("before transfer");
    init(tokenAddress);
    logging.log(tokenBalanceOf(Context.sender));
    logging.log(tokenBalanceOf(Context.contractName));
    assert(transferFrom(Context.sender, Context.contractName, deposit), "token transfer failure");
    logging.log("after transfer");
    logging.log(tokenBalanceOf(Context.sender));
    logging.log(tokenBalanceOf(Context.contractName));
    logging.log("Stream created successfully");
    return streamId;
}

/**
 * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
 * @dev The stream and compounding stream vars objects get deleted to save gas
 *  and optimise contract storage.
 *  Throws if there is a token transfer failure.
 */
export function cancelStreamInternal(streamId: i32): void {
    logging.log(streamId);
    let stream = streams.getSome(streamId);
    logging.log(stream);
    let senderBalance = balanceOf(streamId, stream.sender);
    logging.log(senderBalance);
    let recipientBalance = balanceOf(streamId, stream.recipient);
    logging.log(recipientBalance);
    streams.delete(streamId);
    logging.log(streams.get(streamId));
    init(stream.tokenAddress);
    if (recipientBalance > 0)
        assert(transfer(stream.recipient, recipientBalance), "recipient token transfer failure");
    if (senderBalance > 0) assert(transfer(stream.sender, senderBalance), "sender token transfer failure");
    logging.log("Stream cancelled successfully.");
}

/**
 * @dev Throws if the provided id does not point to a valid stream.
 */
function streamExists(streamId: i32): void {
    logging.log(streamId);
    let res = assert(streams.getSome(streamId).isEntity, "stream does not exist");
    logging.log(res);
}

/**
 * @dev Throws if the caller is not the sender of the recipient of the stream.
 */
function onlySenderOrRecipient(streamId: i32): void {
    logging.log(streamId);
    let res = assert(
        Context.sender === streams.getSome(streamId).sender || Context.sender === streams.getSome(streamId).recipient,
        "caller is not the sender or the recipient of the stream"
    );
    logging.log(res);
}

/**
 * @notice Withdraws from the contract to the recipient's account.
 * @dev Throws if the id does not point to a valid stream.
 *  Throws if the caller is not the sender or the recipient of the stream.
 *  Throws if the amount exceeds the available balance.
 *  Throws if there is a token transfer failure.
 * @param streamId The id of the stream to withdraw tokens from.
 * @param amount The amount of tokens to withdraw.
 * @return bool true=success, otherwise false.
 */
export function withdrawFromStream(streamId: i32, amount: i32): bool {
    logging.log(streamId);
    logging.log(amount);
    new PausableWithoutRenounce().whenNotPaused();
    nonReentrant();
    streamExists(streamId);
    onlySenderOrRecipient(streamId)
    assert(amount > 0, "amount is zero");
    let stream = streams.getSome(streamId);
    logging.log(stream);
    let balance = balanceOf(streamId, stream.recipient);
    logging.log(balance);
    assert(balance >= amount, "amount exceeds the available balance");
    return withdrawFromStreamInternal(streamId, amount);
}

/**
 * @notice Makes the withdrawal to the recipient of the stream.
 * @dev If the stream balance has been depleted to 0, the stream object is deleted
 *  to save gas and optimise contract storage.
 *  Throws if the stream balance calculation has a math error.
 *  Throws if there is a token transfer failure.
 */
function withdrawFromStreamInternal(streamId: i32, amount: i32): bool{
    logging.log("withdrawFromStreamInternal started.");
    logging.log(streamId);
    logging.log(amount);
    let stream = streams.getSome(streamId);
    logging.log(stream);
    /**
     * `subUInt` can only return MathError.INTEGER_UNDERFLOW but we know that `remainingBalance` is at least
     * as big as `amount`. See the `require` check in `withdrawFromInternal`.
     */
    assert(stream.remainingBalance > amount, "Insufficient balance");
    let remainingBalance = sub(stream.remainingBalance, amount);
    logging.log(remainingBalance);
    stream.remainingBalance = remainingBalance;
    logging.log(stream);
    if (stream.remainingBalance == 0) streams.delete(streamId);
    logging.log(stream.remainingBalance);
    // assert(IERC20(stream.tokenAddress).transfer(stream.recipient, amount), "token transfer failure");
    assert(transfer(stream.recipient, amount), "token transfer failure");
    logging.log("withdrawFromStreamInternal succeeded.");
    return true;
}

/**
 * @notice Returns the available funds for the given stream id and address.
 * @dev Throws if the id does not point to a valid stream.
 * @param streamId The id of the stream for which to query the balance.
 * @param who The address for which to query the balance.
 * @return The total funds allocated to `who` as i32.
 */
export function balanceOf(streamId: i32, who: string): i32 {
    logging.log("balanceOf started.");
    logging.log(streamId);
    logging.log(who);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log(stream);
    let delta = deltaOf(streamId);
    logging.log(delta);
    let recipientBalance = mul(delta, stream.ratePerSecond);
    logging.log(recipientBalance);
    /*
     * If the stream `balance` does not equal `deposit`, it means there have been withdrawals.
     * We have to subtract the total amount withdrawn from the amount of money that has been
     * streamed until now.
     */
    if (stream.deposit > stream.remainingBalance) {
        let withdrawalAmount = sub(stream.deposit, stream.remainingBalance);
        logging.log(withdrawalAmount);
        recipientBalance = sub(recipientBalance, withdrawalAmount);
        logging.log(recipientBalance);
        /* `withdrawalAmount` cannot and should not be bigger than `recipientBalance`. */
        assert(withdrawalAmount > recipientBalance, "withdrawalAmount` cannot and should not be bigger than `recipientBalance");
    }

    if (who == stream.recipient) return recipientBalance;
    if (who == stream.sender) {
        logging.log("matched!!");
        /* `recipientBalance` cannot and should not be bigger than `remainingBalance`. */
        assert(recipientBalance > stream.remainingBalance, "`recipientBalance` cannot and should not be bigger than `remainingBalance`");
        let senderBalance = sub(stream.remainingBalance, recipientBalance);
        logging.log(senderBalance);
        return senderBalance;
    }
    return 0;
}

/**
 * @notice Returns either the delta in seconds between `Context.blockTimestamp` and `startTime` or
 *  between `stopTime` and `startTime, whichever is smaller. If `Context.blockTimestamp` is before
 *  `startTime`, it returns 0.
 * @dev Throws if the id does not point to a valid stream.
 * @param streamId The id of the stream for which to query the delta.
 * @return The time delta in seconds.
 */
function deltaOf(streamId: i32): i32 {
    logging.log(streamId);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log(stream);
    logging.log(Context.blockTimestamp);
    if (i32(Context.blockTimestamp) <= stream.startTime) return 0;
    if (i32(Context.blockTimestamp) < stream.stopTime) return i32(Context.blockTimestamp) - stream.startTime;
    const delta = stream.stopTime - stream.startTime;
    logging.log(delta);
    return delta;
}

/**
  * @notice Returns the compounding stream with all its properties.
  * @dev Throws if the id does not point to a valid stream.
  * @param streamId The id of the stream to query.
  * @return The stream object.
  */
export function getStream(streamId: i32): Stream {
    logging.log(streamId);
    streamExists(streamId);
    const stream = streams.getSome(streamId);
    logging.log(stream);
    const res = new Stream(stream.deposit, stream.ratePerSecond, stream.remainingBalance, stream.startTime, stream.stopTime, stream.recipient, stream.sender, stream.tokenAddress, stream.isEntity);
    logging.log(res);
    return res;
}