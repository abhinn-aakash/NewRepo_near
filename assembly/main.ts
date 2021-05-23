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
let earnings = new PersistentMap<string, i64>("earnings:");

/**
 * @notice fetch earnings of a user account.
 */
let spent = new PersistentMap<string, i64>("spent:");

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

export function createStream(recipient: string, deposit: i64, frequency: FREQUENCY, startTime: u128, stopTime: u128): i64 {
    new PausableWithoutRenounce().whenNotPaused();
    logging.log(`createStream:: recipient: ${recipient}`);
    logging.log(`createStream:: deposit: ${deposit}`);
    logging.log(`createStream:: startTime: ${startTime}`);
    logging.log(`createStream:: stopTime: ${stopTime}`);
    logging.log(`createStream:: Context.blockTimestamp: ${Context.blockTimestamp}`);
    logging.log(`createStream:: new u128(Context.blockTimestamp): ${new u128(Context.blockTimestamp)}`);
    assert(recipient != "0x00", "stream to the zero address");
    assert(recipient != Context.contractName, "stream to the contract itself");
    assert(recipient != Context.sender, "stream to the caller");
    assert(deposit > 0, "deposit is zero");
    assert(startTime <= new u128(Context.blockTimestamp), "start time before block.timestamp");
    assert(stopTime > startTime, "stop time before the start time");

    let ratePerFrequency: i64 = calculateRatePerFrequency(frequency, deposit, startTime, stopTime);

    /* Create and store the stream object. */
    let currentStreamId = storage.getPrimitive<i32>("streamCounter", 0);
    let streamId = currentStreamId;
    logging.log(`createStream:: streamId: ${streamId}`);
    logging.log(`createStream:: streams.contains(streamId): ${streams.contains(streamId)}`);

    let stream: Stream = { streamId, deposit, ratePerFrequency, remainingBalance: deposit, frequency, startTime, stopTime, lastClaimedOn: startTime, recipient, sender: Context.sender, isEntity: true }

    streams.set(streamId, stream);
    logging.log("createStream:: streams.getSome(streamId): ");
    logging.log(streams.getSome(streamId));

    // map sender with the stream id
    AddStreamToList(Context.sender, streamId);

    // map recipient with the stream id
    AddStreamToList(recipient, streamId);

    /* Increment the next stream id. */
    nextStreamId = add(currentStreamId, u32(1));
    storage.set<i32>("streamCounter", nextStreamId);

    // transfer deposit amount to contract address
    ContractPromiseBatch.create(Context.contractName).transfer(new u128(u64(deposit)));
    // update spent amount for sender account
    if (spent.contains(Context.sender)) spent.set(Context.sender, spent.getSome(Context.sender) + deposit);
    else spent.set(Context.sender, deposit);

    logging.log("createStream:: Stream created successfully");
    return streamId;
}

function calculateRatePerFrequency(frequency: FREQUENCY, deposit: i64, startTime: u128, stopTime: u128): i64 {
    let ratePerFrequency: u128 = new u128(0);
    let depositu128 = new u128(deposit);
    logging.log(`calculateRatePerFrequency:: depositu128:  ${depositu128}`);
    let duration = u128.div(u128.sub(stopTime, startTime), new u128(1000000000));
    logging.log(`calculateRatePerFrequency:: duration: ${duration}`);
    /* This condition avoids dealing with remainders */
    // assert(deposit % duration == 0, "deposit not multiple of time delta");

    if (frequency === FREQUENCY.SECOND) {
        ratePerFrequency = u128.div(depositu128, duration);
    } else if (frequency === FREQUENCY.MINUTE) {
        ratePerFrequency = u128.div(u128.mul(depositu128, new u128(60)), duration);
    } else if (frequency === FREQUENCY.HOURLY) {
        ratePerFrequency = u128.div(u128.mul(depositu128, new u128(3600)), duration);
    } else if (frequency === FREQUENCY.DAILY) {
        ratePerFrequency = u128.div(u128.mul(depositu128, new u128(86400)), duration);
    } else if (frequency === FREQUENCY.WEEKLY) {
        ratePerFrequency = u128.div(u128.mul(depositu128, new u128(604800)), duration);
    } else if (frequency === FREQUENCY.MONTHLY) {
        ratePerFrequency = u128.div(u128.mul(depositu128, new u128(2629743)), duration); // 30.44 days
    }
    logging.log(`calculateRatePerFrequency:: ratePerFrequency:  ${ratePerFrequency}`);
    return ratePerFrequency.toI64();
}

/**
 * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
 * @dev The stream and compounding stream vars objects get deleted to save gas
 *  and optimise contract storage.
 *  Throws if there is a token transfer failure.
 */
export function cancelStream(streamId: i32): void {
    logging.log(`cancelStream:: streamId: ${streamId}`);
    let stream = streams.getSome(streamId);
    logging.log("cancelStream:: stream: ");
    logging.log(stream);
    logging.log(`cancelStream:: Context.sender: ${Context.sender}`);
    logging.log(`cancelStream:: stream.sender: ${stream.sender}`);
    assert(stream.sender == Context.sender, "Only Sender of the stream can cancel.");
    assert(streamIdMapper.contains(Context.sender), `${streamId} does not exist in the sender's stream list`);
    assert(streamIdMapper.contains(stream.recipient), `${streamId} does not exist in the recipient's stream list`);
    let senderBalance = balanceOf(streamId, stream.sender);
    logging.log(`cancelStream:: senderBalance: ${senderBalance}`);
    let recipientBalance = balanceOf(streamId, stream.recipient);
    logging.log(`cancelStream:: recipientBalance: ${recipientBalance}`);
    streams.delete(streamId);

    logging.log("cancelStream:: stream");
    logging.log(streams.get(streamId));
    logging.log("cancelStream:: Settling recipient's balance...");
    if (recipientBalance > 0) assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(u64(recipientBalance))), "recipient token transfer failure");
    let currentEarning = earnings.getSome(stream.recipient);
    logging.log(`cancelStream:: current earning of ${stream.recipient}: ${currentEarning}`);
    let updatedEarning = add(currentEarning, recipientBalance);
    earnings.set(stream.recipient, updatedEarning);
    logging.log(`cancelStream:: updated earnings of ${stream.recipient}: ${earnings.getSome(stream.recipient)}`);
    logging.log("cancelStream:: Settled recipient's balance successfully...");

    removeStreamFromList(stream.recipient, streamId);

    logging.log("cancelStream:: Settling depositer's balance...");
    if (senderBalance > 0) assert(ContractPromiseBatch.create(stream.sender).transfer(new u128(u64(senderBalance))), "sender token transfer failure");
    let currentSpent = spent.getSome(stream.sender);
    logging.log(`cancelStream:: ${stream.sender}'s current spent: ${currentSpent}`);
    let updatedSpent = currentSpent - senderBalance;
    spent.set(stream.sender, updatedSpent);
    logging.log(`cancelStream:: ${stream.sender}'s updated spent: ${spent.getSome(stream.sender)}`);
    logging.log("cancelStream:: Settled depositer's balance successfully...");

    removeStreamFromList(stream.sender, streamId);

    logging.log("cancelStream:: Stream cancelled successfully.");
}

/**
 * @dev Removes specific streamId from the user account's stream array.
 */
function removeStreamFromList(accountId: string, streamId: i32): void {
    logging.log(`removeStreamFromList:: Removing ${streamId} from ${accountId}'s stream list`);
    let currentStreams: i32[];
    let index: i32;
    if (streamIdMapper.contains(accountId)) {
        logging.log(`removeStreamFromList:: found account in streamId mapping`);
        currentStreams = streamIdMapper.getSome(accountId);
        if (currentStreams) {
            index = currentStreams.indexOf(streamId);
            if (index > -1) {
                const updatedStreams = currentStreams.splice(index, 1);
                streamIdMapper.set(accountId, updatedStreams);
            }
        }
    } else logging.log(`removeStreamFromList:: ${streamId} not found in ${accountId}'s stream list`);
    logging.log(`removeStreamFromList:: streamIdMapper.getSome(accountId): ${streamIdMapper.getSome(accountId)}`);
    logging.log(`removeStreamFromList:: Removed ${streamId} from ${accountId}'s stream list`);
}

/**
 * @dev Add specific streamId in the user account's stream array.
 */
function AddStreamToList(accountId: string, streamId: i32): void {
    logging.log(`AddStreamToList:: Pushing ${streamId} to ${accountId}'s stream list`);
    let currentStreams: i32[] = [];
    logging.log(`AddStreamToList:: streamIdMapper contains(accountId): ${streamIdMapper.contains(accountId)}`);
    if (streamIdMapper.contains(accountId)) {
        logging.log(`AddStreamToList:: streamIdMapper.contains(accountId): ${streamIdMapper.contains(accountId)}`);
        currentStreams = streamIdMapper.getSome(accountId);
        logging.log(`AddStreamToList:: currentStreams: ${currentStreams}`);
        if (currentStreams.indexOf(streamId) === -1) {
            currentStreams.push(streamId);
            streamIdMapper.set(accountId, currentStreams);
            logging.log(`AddStreamToList:: Pushed ${streamId} to ${accountId}'s stream list`);
        }
        logging.log(`AddStreamToList:: ${streamId} already exist in the list`);
    } else {
        currentStreams[i32(0)] = streamId;
        streamIdMapper.set(accountId, currentStreams);
    }
    logging.log(`AddStreamToList:: streamIdMapper.getSome(accountId): ${streamIdMapper.getSome(accountId)}`);
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
function calculateClaimedTime(claimableAmount: i64, amount: i64, stream: Stream): u128 {
    let claimedTime: u128 = new u128(0);
    let duration = u128.sub(stream.stopTime, stream.startTime);
    logging.log(`calculateClaimedTime:: duration: ${duration}`);
    // convert i64 to u128
    const amount_u128 = new u128(amount);
    const rate_u128 = new u128(stream.ratePerFrequency)

    // If claimAmount is fully claimed, then claimedTime is current time
    if (sub(claimableAmount, amount) === 0) return new u128(Context.blockTimestamp);
    // If claimedAmount is partially claimed, then claimedTime will be calculated as per the amount to be withdrawn
    if (stream.frequency === FREQUENCY.SECOND) {
        // claimedTime per frequency
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        //if frequency is already in seconds, then no conversion required
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.MINUTE) {
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        claimedTime = u128.mul(claimedTime, new u128(60));
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.HOURLY) {
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        claimedTime = u128.mul(claimedTime, new u128(3600));
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.DAILY) {
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        claimedTime = u128.mul(claimedTime, new u128(86400));
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.WEEKLY) {
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        claimedTime = u128.mul(claimedTime, new u128(604800));
        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    } else if (stream.frequency === FREQUENCY.MONTHLY) {
        claimedTime = u128.div(amount_u128, rate_u128);
        // convert claimedTime to seconds
        claimedTime = u128.mul(claimedTime, new u128(2629743)); // replace 30.44 with number of days in a month

        // Add claimed time in seconds to start time of stream to get the actual claimedTime
        claimedTime = u128.add(stream.startTime, claimedTime);
    }
    return claimedTime;
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
export function withdrawFromStream(streamId: i32, amount: i64): bool {
    logging.log("withdrawFromStream:: Withdraw from stream started...");
    new PausableWithoutRenounce().whenNotPaused();
    nonReentrant();
    // Throws if stream does not exist
    streamExists(streamId);
    // Only Sender or Recipient can access this stream
    onlySenderOrRecipient(streamId)
    // failed if the withdrawl amount is zero
    assert(amount > 0, "amount is zero");
    let stream = streams.getSome(streamId);
    logging.log(`withdrawFromStream:: stream`);
    logging.log(stream);
    // get claimableAmount which recipient is allowed to claim
    let claimableAmount = balanceOf(streamId, stream.recipient);

    assert(claimableAmount >= amount, "withdrawl amount exceeds the available claimable amount");
    // Contract transfers withdrawl amount to recipient account
    assert(ContractPromiseBatch.create(stream.recipient).transfer(new u128(u64(amount))), "token transfer failure");

    let remainingBalance = sub(stream.remainingBalance, amount);
    logging.log(`withdrawFromStream:: remainingBalance: ${remainingBalance}`);
    // store remaining balance after deducting amount to be withdrawn
    stream.remainingBalance = remainingBalance;
    // store last claimed time
    stream.lastClaimedOn = calculateClaimedTime(claimableAmount, amount, stream);
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
        earnings.set(stream.recipient, add(currentEarning, amount));
    } else earnings.set(stream.recipient, amount);
    // Show recipient's earnings
    logging.log(`withdrawFromStream:: earnings.getSome(stream.recipient): ${earnings.getSome(stream.recipient)}`);
    logging.log("withdrawFromStreamInternal succeeded.");
    return true;
}

/**
 * @notice Returns the available funds for the given stream id and address.
 * @dev Throws if the id does not point to a valid stream.
 * @param streamId The id of the stream for which to query the balance.
 * @param accountId The address for which to query the balance.
 * @return The total funds allocated to `accountId` as i64.
 */
export function balanceOf(streamId: i32, accountId: string): i64 {
    logging.log(`balanceOf:: checking balance of ${accountId} in ${streamId}.`);
    logging.log("balanceOf:: accountId: " + accountId);
    streamExists(streamId)
    let stream = streams.getSome(streamId);
    logging.log("balanceOf:: stream: ");
    logging.log(stream);
    // get time consumed
    let delta = deltaOf(stream);
    logging.log("balanceOf:: delta: " + delta.toString());
    let claimableAmount = u128.mul(delta, new u128(stream.ratePerFrequency)).toI64();
    logging.log(`balanceOf:: claimableAmount: ${claimableAmount}`);
    /*
     * If the stream `balance` does not equal `deposit`, it means there have been withdrawals.
     * We have to subtract the total amount withdrawn from the amount of money that has been
     * streamed until now.
     */
    if (stream.deposit > stream.remainingBalance) {
        let withdrawalAmount = sub(stream.deposit, stream.remainingBalance);
        logging.log(`balanceOf:: withdrawalAmount: ${withdrawalAmount}`);
        claimableAmount = sub(claimableAmount, withdrawalAmount);
        logging.log(`balanceOf:: claimableAmount: ${claimableAmount}`);
    }
    if (accountId == stream.recipient) return claimableAmount;
    if (accountId == stream.sender) {
        logging.log(`balanceOf:: accountId: ${accountId} belongs to sender: ${stream.sender}`);
        let senderBalance = sub(stream.remainingBalance, claimableAmount);
        logging.log(`balanceOf:: senderBalance: ${senderBalance}`);
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
export function deltaOf(stream: Stream): u128 {
    logging.log("deltaOf:: getting time delta between the start time and stop time...");
    logging.log(`deltaOf:: Context.blockTimestamp: ${Context.blockTimestamp}`);
    // Return 0 if current time is before start time or equal to start time
    if (new u128(Context.blockTimestamp) <= stream.startTime) {
        logging.log(`deltaOf:: currentTime: ${new u128(Context.blockTimestamp)} is before startTime: ${stream.startTime} or equal.`);
        return new u128(0);
    }
    // Return (currentTime - start time) if current time is between stop time and start time
    if (new u128(Context.blockTimestamp) < stream.stopTime) {
        logging.log(`deltaOf:: currentTime: ${new u128(Context.blockTimestamp)} is before stopTime: ${stream.stopTime} or after startTime: ${stream.startTime}.`);
        return u128.sub(new u128(Context.blockTimestamp), stream.startTime);
    }
    logging.log(`deltaOf:: currentTime: ${new u128(Context.blockTimestamp)} is after stopTime: ${stream.stopTime}.`);
    // Return (stop time - start time) if current time is after stop time
    const delta = u128.sub(stream.stopTime, stream.startTime);
    logging.log(`deltaOf:: time delta: ${delta}.`);
    return delta;
}

/**
 * @notice Returns the compounding stream with all its properties.
 * @dev Throws if the id does not point to a valid stream.
 * @param streamId The id of the stream to query.
 * @return The stream object.
 */
export function getStream(streamId: i32): Stream {
    logging.log(`getStream:: streamId: ${streamId}`);
    streamExists(streamId);
    const stream = streams.getSome(streamId);
    logging.log("getStream:: stream");
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
    logging.log(`getStreamsByAccountId:: fetching stream details by ${accountId}`);
    let streamIds = streamIdMapper.getSome(accountId);
    let stream: Stream;
    logging.log(`getStreamsByAccountId: streamIds: ${streamIds}`);
    let streamDetails: Stream[] = [];
    for (let index = 0; index < streamIds.length; index++) {
        const streamId = streamIds[index];
        if (streams.contains(streamId)) {
            logging.log(`getStreamsByAccountId: ${streamId} found in streams`);
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
export function getEarnings(accountId: string): i64 {
    logging.log(`getEarnings:: fetching earnings of ${accountId}`);
    if (earnings.contains(accountId)) return earnings.getSome(accountId);
    logging.log(`getEarnings:: no earnings of ${accountId}`);
    return 0;
}

/**
 * @notice Returns the amount spent on streams.
 * @param accountId account id of the user's account
 * @return The spent amount in u64
 */
export function getSpent(accountId: string): i64 {
    logging.log(`getSpent:: fetching amount spent by ${accountId}`);
    if (spent.contains(accountId)) return spent.getSome(accountId);
    logging.log(`getSpent:: no amount spent by ${accountId} in streams`);
    return 0;
}