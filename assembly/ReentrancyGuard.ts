import { initializer } from "./Initializable";

/**
 * @title Helps contracts guard against reentrancy attacks.
 * @dev If you mark a function `nonReentrant`, you should also
 * mark it `external`.
 */
/// @dev counter to allow mutex lock with only one SSTORE operation
let _guardCounter: number;

export function initializeReentrancyGuard(): void {
    // The counter starts at one to prevent changing it from zero to a non-zero
    // value, which is a more expensive operation.
    initializer();
    _guardCounter = 1;
}

/**
 * @dev Prevents a contract from calling itself, directly or indirectly.
 * Calling a `nonReentrant` function from another `nonReentrant`
 * function is not supported. It is possible to prevent this from happening
 * by making the `nonReentrant` function external, and make it call a
 * `private` function that does the actual work.
 */
export function nonReentrant(): void {
    _guardCounter += 1;
    let localCounter = _guardCounter;
    // _;
    assert(localCounter == _guardCounter);
}

// let ______gap: Uint32Array[50];