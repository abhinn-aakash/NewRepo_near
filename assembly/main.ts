import { Context, logging, PersistentMap, storage, ContractPromiseBatch, u128 } from "near-sdk-as";
import { OwnableWithoutRenounce } from "./OwnableWithoutRenounce";
import { PausableWithoutRenounce } from "./PausableWithoutRenounce";
import { nonReentrant } from "./ReentrancyGuard";
import { Stream } from "./models";
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
let streamIdMapper = new PersistentMap<string, i32[]>("accountId~streamIds[]:");

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

enum FREQUENCY {
    SECOND = 1,
    MINUTE = 2,
    HOURLY = 3,
    DAILY = 4,
    WEEKLY = 5,
    MONTHLY = 6
}

export function init(): void {
    new OwnableWithoutRenounce(Context.sender);
    new PausableWithoutRenounce().initialize(Context.sender);
    // reset stream counter
    storage.set<i32>("streamCounter", 0);
    // reset streamId list for accounts
    nextStreamId = storage.getPrimitive<i32>("streamCounter", 0) + 1;
    storage.set<i32>("streamCounter", nextStreamId);
}

export function createStream(recipient: string, deposit: i32, frequency: FREQUENCY, startTime: i32, stopTime: i32): i32 {
    new PausableWithoutRenounce().whenNotPaused();
    logging.log(recipient);
    logging.log(deposit);
    logging.log(startTime);
    logging.log(stopTime);
    logging.log(Context.blockTimestamp);
    assert(recipient != "0x00", "stream to the zero address");
    assert(recipient != Context.contractName, "stream to the contract itself");
    assert(recipient != Context.sender, "stream to the caller");
    assert(deposit > 0, "deposit is zero");
    assert(u64(startTime) <= Context.blockTimestamp, "start time before block.timestamp");
    assert(stopTime > startTime, "stop time before the start time");

    let ratePerFrequency = calculateRatePerFrequency(frequency, deposit, startTime, stopTime);

    /* Create and store the stream object. */
    let currentStreamId = storage.getPrimitive<i32>("streamCounter", 0);
    let streamId = currentStreamId;
    logging.log(streamId);
    logging.log(streams.contains(streamId));

    let stream: Stream = { streamId, deposit, ratePerFrequency, remainingBalance: deposit, frequency, startTime, stopTime, lastClaimedOn: startTime, recipient, sender: Context.sender, isEntity: true }

    streams.set(streamId, stream);
    logging.log(streams.getSome(streamId));

    // map sender with the stream id
    AddStreamToList(Context.sender, streamId);

    // map recipient with the stream id
    AddStreamToList(recipient, streamId);

    /* Increment the next stream id. */
    nextStreamId = add(currentStreamId, u32(1));
    storage.set<i32>("streamCounter", nextStreamId);

    // transfer deposit amount to contract address
    ContractPromiseBatch.create(Context.contractName).transfer(new u128(deposit));
    // update spent amount for sender account
    if (spent.contains(Context.sender)) spent.set(Context.sender, spent.getSome(Context.sender) + deposit);
    else spent.set(Context.sender, deposit);

    logging.log("Stream created successfully");
    return streamId;
}

function calculateRatePerFrequency(frequency: FREQUENCY, deposit: i32, startTime: i32, stopTime: i32): i32 {
    let ratePerFrequency: i32 = 0;

    let duration = sub(stopTime, startTime);
    logging.log(duration);

    /* This condition avoids dealing with remainders */
    // assert(deposit % duration == 0, "deposit not multiple of time delta");

    if (frequency === FREQUENCY.SECOND) {
        ratePerFrequency = div(deposit, duration);
    } else if (frequency === FREQUENCY.MINUTE) {
        ratePerFrequency = div(deposit, mul(duration, 60));
    } else if (frequency === FREQUENCY.HOURLY) {
        ratePerFrequency = div(deposit, mul(duration, 3600));
    } else if (frequency === FREQUENCY.DAILY) {
        ratePerFrequency = div(deposit, mul(duration, 86400));
    } else if (frequency === FREQUENCY.WEEKLY) {
        ratePerFrequency = div(deposit, mul(duration, 604800));
    } else if (frequency === FREQUENCY.MONTHLY) {
        ratePerFrequency = div(deposit, mul(duration, 18144000)); // 30 days
    }
    logging.log(ratePerFrequency);
    return ratePerFrequency;
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
    logging.log(Context.sender);
    logging.log(stream.sender);
    assert(stream.sender == Context.sender, "Only Sender of the stream can cancel.");
    assert(streamIdMapper.contains(Context.sender), `${streamId} does not exist in the sender's stream list`);
    assert(streamIdMapper.contains(stream.recipient), `${streamId} does not exist in the recipient's stream list`);
    let senderBalance = balanceOf(streamId, stream.sender);
    logging.log(senderBalance);
    let recipientBalance = balanceOf(streamId, stream.recipient);
    logging.log(recipientBalance);
    streams.delete(streamId);

    logging.log(streams.get(streamId));
    logging.log("Settling recipient's balance...");
    if (recipientBalance > 0) assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(recipientBalance)), "recipient token transfer failure");
    let currentEarning = earnings.getSome(stream.recipient);
    logging.log(currentEarning);
    let updatedEarning = currentEarning + recipientBalance;
    earnings.set(stream.recipient, updatedEarning);
    logging.log(earnings.getSome(stream.recipient));
    logging.log("Settled recipient's balance successfully...");

    removeStreamFromList(stream.recipient, streamId);

    logging.log("Settling depositer's balance...");
    if (senderBalance > 0) assert(ContractPromiseBatch.create(stream.sender).transfer(new u128(senderBalance)), "sender token transfer failure");
    let currentSpent = spent.getSome(stream.sender);
    logging.log(currentSpent);
    let updatedSpent = currentSpent - senderBalance;
    spent.set(stream.sender, updatedSpent);
    logging.log(spent.getSome(stream.sender));
    logging.log("Settled depositer's balance successfully...");

    removeStreamFromList(stream.sender, streamId);

    logging.log("Stream cancelled successfully.");
}

/**
 * @dev Removes specific streamId from the user account's stream array.
 */
function removeStreamFromList(accountId: string, streamId: i32): void {
    logging.log(`Removing ${streamId.toString()} from ${accountId}'s stream list`);
    let currentStreams: i32[];
    let index: i32;
    if (streamIdMapper.contains(accountId)) {
        currentStreams = streamIdMapper.getSome(accountId);
        if (currentStreams) {
            index = currentStreams.indexOf(streamId);
            if (index > -1) {
                const updatedStreams = currentStreams.splice(index, 1);
                streamIdMapper.set(accountId, updatedStreams);
            }
        }
    } else logging.log(`${streamId.toString()} not found in ${accountId}'s stream list`);
    logging.log(streamIdMapper.getSome(accountId));
    logging.log(`Removed ${streamId} from ${accountId}'s stream list`);
}

/**
 * @dev Add specific streamId in the user account's stream array.
 */
function AddStreamToList(accountId: string, streamId: i32): void {
    logging.log(`Pushing ${streamId} to ${accountId}'s stream list`);
    let currentStreams: i32[] = [0];
    logging.log(streamIdMapper.contains(accountId));
    if (streamIdMapper.contains(accountId)) {
        logging.log(streamIdMapper.getSome(accountId));
        currentStreams = streamIdMapper.getSome(accountId);
        if(currentStreams.indexOf(streamId) === -1){
            currentStreams.push(streamId); 
            streamIdMapper.set(accountId, currentStreams);
            logging.log(`Pushed ${streamId.toString()} to ${accountId}'s stream list`);
        }
        logging.log(`${streamId} already exist in the list`);       
    } else {
        let index = currentStreams.at(0);
        currentStreams[index] = streamId;
        streamIdMapper.set(accountId, currentStreams);
    }
    logging.log(streamIdMapper.getSome(accountId).toString());
}

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
 * @dev Calculate claimedTime accroding to the amount to be withdrawn, in case user is not fully 
 */
function calculateClaimedTime(claimableAmount: u64, amount: i32, stream: Stream): u64 {
    let claimedTime: i32 = 0;
    let claimedOn:u64;
    let duration = sub(stream.stopTime, stream.startTime);
    logging.log(duration);
    // amount/ratePerSecond
    // If claimAmount is fully claimed, then claimedTime is current time
    if(sub(claimableAmount, amount) === 0)  return claimedOn = Context.blockTimestamp;
    // If claimedAmount is partially claimed, then claimedTime will be calculated as per the amount to be withdrawn
    if (stream.frequency === FREQUENCY.SECOND) {
        // claimedTime per frequency
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        //if frequency is already in seconds, then no conversion required
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.MINUTE) {
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        claimedTime = claimedTime * 60;
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.HOURLY) {
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        claimedTime = claimedTime * 60 * 60;
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.DAILY) {
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        claimedTime = claimedTime * 24 * 60 * 60;
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.WEEKLY) {
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        claimedTime = claimedTime * 7 * 24 * 60 * 60;
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.MONTHLY) {
        claimedTime = div(amount, stream.ratePerFrequency);
        // convert claimedTime to seconds
        claimedTime = claimedTime * 30 * 7 * 24 * 60 * 60; // replace 30 with number of days in a month

        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = add(stream.startTime, claimedTime);
    }
    claimedOn = claimedTime;
    return claimedOn;
}
/**
 * @notice akes the withdrawal to the recipient of the stream.
 * @dev  If the stream balance has been depleted to 0, the stream object is deleted
 *  to save gas and optimise contract storage.
 *  Throws if the id does not point to a valid stream.
 *  Throws if the caller is not the sender or the recipient of the stream.
 *  Throws if the amount exceeds the available balance.
 *  Throws if there is a token transfer failure.
 * @param streamId The id of the stream to withdraw tokens from.
 * @param amount The amount of tokens to withdraw.
 * @return bool true=success, otherwise false.
 */
export function withdrawFromStream(streamId: i32, amount: i32): bool {
    logging.log("Withdraw from stream started...");
    new PausableWithoutRenounce().whenNotPaused();
    nonReentrant();
    // Throws if stream does not exist
    streamExists(streamId);
    // Only Sender or Recipient can access this stream
    onlySenderOrRecipient(streamId)
    // failed if the withdrawl amount is zero
    assert(amount > 0, "amount is zero");
    let stream = streams.getSome(streamId);
    logging.log(stream);
    // get claimableAmount which recipient is allowed to claim
    let claimableAmount = balanceOf(streamId, stream.recipient);

    assert(claimableAmount >= u64(amount), "withdrawl amount exceeds the available claimable amount");
    // Contract transfers withdrawl amount to recipient account
    assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(amount)), "token transfer failure");

    let remainingBalance = sub(stream.remainingBalance, amount);
    logging.log(remainingBalance);
    // store remaining balance after deducting amount to be withdrawn
    stream.remainingBalance = remainingBalance;
    // store last claimed time
    stream.lastClaimedOn = i32(calculateClaimedTime(claimableAmount, amount, stream));
    // Setting lastClaimedOn and remaining balance in the stream
    streams.set(streamId, stream);

    // Stream gets deleted if amount is fully claimed by receiver
    if (stream.remainingBalance == 0) {
        streams.delete(streamId);
        removeStreamFromList(stream.recipient, streamId);
        removeStreamFromList(stream.sender, streamId);
    }
    // Updating recipient's earnings from streams
    if (earnings.contains(stream.recipient)) {
        let currentEarning = earnings.getSome(stream.recipient);
        earnings.set(stream.recipient, currentEarning + amount);
    } else earnings.set(stream.recipient, amount);
    // Show recipient's earnings
    logging.log(earnings.getSome(stream.recipient));
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
    logging.log("accountId: " + accountId);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log(stream);
    // get time consumed
    let delta = deltaOf(stream);
    logging.log("delta: " + delta.toString());
    let claimableAmount = mul(delta, u64(stream.ratePerFrequency));
    logging.log("claimableAmount: " + claimableAmount.toString());
    /*
     * If the stream `balance` does not equal `deposit`, it means there have been withdrawals.
     * We have to subtract the total amount withdrawn from the amount of money that has been
     * streamed until now.
     */
    if (stream.deposit > stream.remainingBalance) {
        let withdrawalAmount = sub(u64(stream.deposit), stream.remainingBalance);
        logging.log("withdrawalAmount: " + withdrawalAmount.toString());
        claimableAmount = sub(claimableAmount, withdrawalAmount);
        logging.log("claimableAmount: " + claimableAmount.toString());
    }

    if (accountId == stream.recipient) return claimableAmount;
    if (accountId == stream.sender) {
        logging.log("matched!!");
        let senderBalance = sub(u64(stream.remainingBalance), claimableAmount);
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
export function deltaOf(stream: Stream): u64 {
    logging.log("getting time delta between the start time and stop time...")
    logging.log(Context.blockTimestamp);
    // Return 0 if current time is before start time or equal to start time
    if (Context.blockTimestamp <= u64(stream.startTime)){
        logging.log(`currentTime: ${Context.blockTimestamp} is before startTime: ${u64(stream.startTime)} or equal.`);
        return 0;
    } 
    // Return (currentTime - start time) if current time is between stop time and start time
    if (Context.blockTimestamp < u64(stream.stopTime)){
        logging.log(`currentTime: ${Context.blockTimestamp} is before stopTime: ${u64(stream.stopTime)} or after startTime: ${u64(stream.startTime)}.`);
        return Context.blockTimestamp - u64(stream.startTime);
    }
    logging.log(`currentTime: ${Context.blockTimestamp} is after stopTime: ${u64(stream.stopTime)}.`);
    // Return (stop time - start time) if current time is after stop time
    const delta = stream.stopTime - stream.startTime;
    logging.log(`time delta: ${delta}.`);
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
export function getStreamsByAccountId(accountId: string): Stream[] {
    logging.log(`fetching stream details by ${accountId}`);
    let streamIds = streamIdMapper.getSome(accountId);
    let stream:Stream;
    logging.log(streamIds);
    let streamDetails: Stream[] = [];
    for (let index = 0; index < streamIds.length; index++) {
        const streamId = streamIds[index];
        if(streams.contains(streamId)){
            stream = streams.getSome(streamId);
            streamDetails.push(stream);
        }
        if (index != streamIds.length) continue;
        else return streamDetails;
    };
    return streamDetails;
}

/**
 * @notice Returns the amount earned from streams.
 * @param accountId account id of the user's account
 * @return The earned amount in u64
 */
export function getEarnings(accountId: string): u64 {
    if(earnings.contains(accountId)) return earnings.getSome(accountId);
    return 0;
}

/**
 * @notice Returns the amount spent on streams.
 * @param accountId account id of the user's account
 * @return The spent amount in u64
 */
export function getSpent(accountId: string): u64 {
    if(spent.contains(accountId)) return spent.getSome(accountId);
    return 0;
}