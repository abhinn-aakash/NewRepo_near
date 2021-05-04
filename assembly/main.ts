import { Context, logging, PersistentMap, storage, ContractPromiseBatch, u128 } from "near-sdk-as";
import { OwnableWithoutRenounce } from "./OwnableWithoutRenounce";
import { PausableWithoutRenounce } from "./PausableWithoutRenounce";
import { nonReentrant } from "./ReentrancyGuard";
import { Stream } from "./models";
// import * as nearAPI from 'near-api-js';
/**
 * @title Money Streaming
 * @author Dimple-Kanwar
 */

/**
 * @notice The stream objects identifiable by their unsigned integer ids.
 */
let streams = new PersistentMap<i32, Stream>("s:");

/**
 * @notice The stream Ids identifiable by their sender's account ids.
 */
// let streamIdMapper = new PersistentMap<string, i32[]>("sender/recipient~streamIds[]:");


// /**
// * @notice The stream Ids identifiable by their recipient's account ids.
// */
// let recipientStreamIdMapper = new PersistentMap<string, i32[] | null>("recipient~streamIds[]:");

/**
 * @notice fetch earnings of a user account.
 */
let earnings = new PersistentMap<string, u64>("earnings:");

/**
 * @notice fetch earnings of a user account.
 */
let spent = new PersistentMap<string, u64>("spent:");

/**
 * @notice Counter for new stream ids.
 */
let nextStreamId: i32;

export function init(): void {
    new OwnableWithoutRenounce(Context.sender);
    new PausableWithoutRenounce().initialize(Context.sender);
    nextStreamId = storage.getPrimitive<i32>("streamCounter", 0) + 1;
    storage.set<i32>("streamCounter", nextStreamId);
}

export function createStream(recipient: string, deposit: i32, startTime: i32, stopTime: i32): i32 {
    new PausableWithoutRenounce().whenNotPaused();
    logging.log(recipient);
    logging.log(deposit);
    logging.log(startTime);
    logging.log(stopTime);
    logging.log(Context.contractName);
    logging.log(Context.blockTimestamp);
    assert(recipient != "0x00", "stream to the zero address");
    assert(recipient != Context.contractName, "stream to the contract itself");
    assert(recipient != Context.sender, "stream to the caller");
    assert(deposit > 0, "deposit is zero");
    assert(u64(startTime) <= Context.blockTimestamp, "start time before block.timestamp");
    assert(stopTime > startTime, "stop time before the start time");
    let duration = sub(stopTime, startTime);
    logging.log(duration);
    /* This condition avoids dealing with remainders */
    assert(deposit % duration == 0, "deposit not multiple of time delta");
    /* Create and store the stream object. */
    let nextStreamId = storage.getPrimitive<i32>("streamCounter", 0);
    let streamId = nextStreamId;
    logging.log(streamId);
    logging.log(streams.contains(streamId));
    let ratePerSecond = div(deposit, duration);
    logging.log(ratePerSecond);
    let stream: Stream = { deposit, ratePerSecond, remainingBalance: deposit, startTime, stopTime, recipient, sender: Context.sender, isEntity: true }
    logging.log(stream);
    streams.set(streamId, stream);
    logging.log(streams.getSome(streamId));

    // map sender with the stream id
    // AddStreamToList(Context.sender, streamId);

    // map recipient with the stream id
    // AddStreamToList(recipient, streamId);

    /* Increment the next stream id. */
    nextStreamId = add(nextStreamId, u32(1));

    // transfer deposit amount to contract address
    const res = ContractPromiseBatch.create(Context.contractName).transfer(new u128(deposit));
    logging.log(res);
    // update spent amount for sender account
    if (spent.contains(Context.sender)) spent.set(Context.sender, spent.getSome(Context.sender) + deposit);
    else spent.set(Context.sender, deposit);

    logging.log("Stream created successfully");
    return streamId;
}

/**
 * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
 * @dev The stream and compounding stream vars objects get deleted to save gas
 *  and optimise contract storage.
 *  Throws if there is a token transfer failure.
 */
export function cancelStream(streamId: i32): void {
    logging.log(streamId);
    let stream = streams.getSome(streamId);
    logging.log(stream);
    // assert(streamIdMapper.contains(Context.sender), `${streamId} does not exist in the sender's stream list`);
    // assert(streamIdMapper.contains(stream.recipient), `${streamId} does not exist in the recipient's stream list`);
    let senderBalance = balanceOf(streamId, stream.sender);
    logging.log(senderBalance);
    let recipientBalance = balanceOf(streamId, stream.recipient);
    logging.log(recipientBalance);
    streams.delete(streamId);

    logging.log(streams.get(streamId));
    logging.log(new u128(recipientBalance));
    logging.log(recipientBalance);
    logging.log("Settling recipient's balance...");
    if (recipientBalance > 0) assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(recipientBalance)), "recipient token transfer failure");
    let currentEarning = earnings.getSome(stream.recipient);
    logging.log(currentEarning);
    let updatedEarning = currentEarning + recipientBalance;
    logging.log(updatedEarning);
    earnings.set(stream.recipient, updatedEarning);
    logging.log(earnings.getSome(stream.recipient));
    logging.log("Settled recipient's balance successfully...");

    // removeStreamFromList(stream.recipient, streamId);

    logging.log("Settling depositer's balance...");
    if (senderBalance > 0) assert(ContractPromiseBatch.create(stream.sender).transfer(new u128(senderBalance)), "sender token transfer failure");
    let currentSpent = spent.getSome(stream.sender);
    logging.log(currentSpent);
    let updatedSpent = currentSpent - senderBalance;
    logging.log(updatedSpent);
    spent.set(stream.sender, updatedSpent);
    logging.log(spent.getSome(stream.sender));
    logging.log("Settled depositer's balance successfully...");

    // removeStreamFromList(stream.sender, streamId);

    logging.log("Stream cancelled successfully.");
}

/**
 * @dev Removes specific streamId from the user account's stream array.
 */
// function removeStreamFromList(accountId: string, streamId: i32): void {
//     logging.log(`Removing ${streamId.toString()} from ${accountId}'s stream list`);
//     let currentStreams: i32[];
//     let index: i32;
//     if (streamIdMapper.contains(accountId)) {
//         let streams = streamIdMapper.getSome(accountId);
//         index = streams.indexOf(streamId);
//         if (index > -1) {
//             currentStreams = streamIdMapper.getSome(accountId);
//             if (currentStreams) {
//                 currentStreams.splice(index, 1);
//             }
//             streamIdMapper.set(accountId, currentStreams);
//         }
//     } else logging.log(`${streamId.toString()} not found in ${accountId}'s stream list`);
//     logging.log(streamIdMapper.getSome(accountId));
//     logging.log(`Removed ${streamId} from ${accountId}'s stream list`);
// }

/**
 * @dev Add specific streamId in the user account's stream array.
 */
// function AddStreamToList(accountId: string, streamId: i32): void {
//     logging.log(`Pushing ${streamId} to ${accountId}'s stream list`);
//     let currentStreams: i32[] = [0];
//     if (streamIdMapper.contains(accountId)) {
//         currentStreams = streamIdMapper.getSome(accountId);
//         currentStreams.push(streamId);
//     } else {
//         let index = currentStreams.at(0);
//         currentStreams[index] = streamId;
//     }
//     streamIdMapper.set(accountId, currentStreams);
//     logging.log(`Pushed ${streamId.toString()} to recipient's stream list`);
//     logging.log(streamIdMapper.getSome(accountId).toString());
// }

/**
 * @dev Throws if the provided id does not point to a valid stream.
 */
function streamExists(streamId: i32): void {
    assert(streams.contains(streamId), `Stream ${streamId} does not exist`)
    assert(streams.getSome(streamId).isEntity, "stream exists but isEntity is false");
}

/**
 * @dev Throws if the caller is not the sender of the recipient of the stream.
 */
function onlySenderOrRecipient(streamId: i32): void {
    assert(
        Context.sender !== streams.getSome(streamId).sender || Context.sender !== streams.getSome(streamId).recipient,
        "caller is not the sender or the recipient of the stream"
    );
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
    assert(balance >= u64(amount), "amount exceeds the available balance");
    return withdrawFromStreamInternal(streamId, amount);
}

/**
 * @notice Makes the withdrawal to the recipient of the stream.
 * @dev If the stream balance has been depleted to 0, the stream object is deleted
 *  to save gas and optimise contract storage.
 *  Throws if the stream balance calculation has a math error.
 *  Throws if there is a token transfer failure.
 */
function withdrawFromStreamInternal(streamId: i32, amount: i32): bool {
    logging.log("withdrawFromStreamInternal started.");
    logging.log(streamId);
    logging.log(amount);
    let stream = streams.getSome(streamId);
    logging.log(stream);
    /**
     * `subUInt` can only return MathError.INTEGER_UNDERFLOW but we know that `remainingBalance` is at least
     * as big as `amount`. See the `require` check in `withdrawFromInternal`.
     */
    let remainingBalance = sub(stream.remainingBalance, amount);
    logging.log(remainingBalance);
    stream.remainingBalance = remainingBalance;
    logging.log(stream);
    streams.set(streamId, stream);
    if (stream.remainingBalance == 0) {
        streams.delete(streamId);
        // removeStreamFromList(stream.recipient, streamId);
        // removeStreamFromList(stream.sender, streamId);
    }
    assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(amount)), "token transfer failure");
    logging.log("Updating recipient's earnings...");
    if (earnings.contains(stream.recipient)) {
        let currentEarning = earnings.getSome(stream.recipient);
        earnings.set(stream.recipient, currentEarning + amount);
    } else earnings.set(stream.recipient, amount);
    logging.log(earnings.getSome(stream.recipient));
    logging.log("Updated recipient's earnings.");
    logging.log("withdrawFromStreamInternal succeeded.");
    return true;
}

/**
 * @notice Returns the available funds for the given stream id and address.
 * @dev Throws if the id does not point to a valid stream.
 * @param streamId The id of the stream for which to query the balance.
 * @param accountId The address for which to query the balance.
 * @return The total funds allocated to `accountId` as i32.
 */
export function balanceOf(streamId: i32, accountId: string): u64 {
    logging.log("balanceOf started.");
    logging.log("streamId: " + streamId.toString());
    logging.log("accountId: " + accountId);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log(stream);
    let delta = deltaOf(streamId);
    logging.log("delta: " + delta.toString());
    let recipientBalance = mul(delta, u64(stream.ratePerSecond));
    logging.log("recipientBalance: " + recipientBalance.toString());
    /*
     * If the stream `balance` does not equal `deposit`, it means there have been withdrawals.
     * We have to subtract the total amount withdrawn from the amount of money that has been
     * streamed until now.
     */
    if (stream.deposit > stream.remainingBalance) {
        let withdrawalAmount = sub(u64(stream.deposit), stream.remainingBalance);
        logging.log("withdrawalAmount: " + withdrawalAmount.toString());
        recipientBalance = sub(recipientBalance, withdrawalAmount);
        logging.log("recipientBalance: " + recipientBalance.toString());
    }

    if (accountId == stream.recipient) return recipientBalance;
    if (accountId == stream.sender) {
        logging.log("matched!!");
        let senderBalance = sub(u64(stream.remainingBalance), recipientBalance);
        logging.log("senderBalance: " + senderBalance.toString());
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
export function deltaOf(streamId: i32): u64 {
    logging.log(streamId);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log(stream);
    logging.log(Context.blockTimestamp);
    logging.log(u64(stream.startTime));
    logging.log(Context.blockTimestamp <= u64(stream.startTime));
    logging.log(Context.blockTimestamp < u64(stream.stopTime));
    logging.log(u64(stream.stopTime));
    if (Context.blockTimestamp <= u64(stream.startTime)) return 0;
    if (Context.blockTimestamp < u64(stream.stopTime)) return Context.blockTimestamp - u64(stream.startTime);
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
    return stream;
}

/**
  * @notice Returns all the streams with all its properties by user id.
  * @dev Throws if the id does not point to a valid stream.
  * @param accountId The id of the user to query.
  * @return Array of stream objects.
  */
// export function getStreamsByAccountId(accountId: string): Stream[] | null {
//     logging.log(`fetching stream details by ${accountId}`);
//     let streamIds = streamIdMapper.getSome(accountId);
//     let streamDetails: Stream[];
//     for(let index =0; index < streamIds?.length; index++){
//         let stream = streams.getSome(streamId);
//         streamDetails.push(stream);
//         logging.log(streamDetails);
//         if(index != streamIds?.length) continue;
//         else return streamDetails;
//     };
//     return null;
// }

/**
     * @notice Returns the amount of interest that has been accrued for the given token address.
     * @param tokenAddress The address of the token to get the earnings for.
     * @return The amount of interest as uint256.
     */
export function getEarnings(accountId: string): u64 {
    assert(earnings.contains(accountId),`${accountId} does not have any earnings.`)
    return earnings.getSome(accountId);
}

/**
     * @notice Returns the amount of interest that has been accrued for the given token address.
     * @param tokenAddress The address of the token to get the earnings for.
     * @return The amount of interest as uint256.
     */
export function getSpent(accountId: string): u64 {
    assert(spent.contains(accountId),`${accountId} have not spent yet.`)
    return spent.getSome(accountId);
}