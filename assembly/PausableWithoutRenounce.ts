import { initializer } from "./Initializable";
import {PauserRoleWithoutRenounce} from "./PauserRoleWithoutRenounce";
/**
 * @title PausableWithoutRenounce
 * @author Sablier
 * @notice Fork of OpenZeppelin's Pausable, a contract module which allows children to implement an
 *  emergency stop mechanism that can be triggered by an authorized account, but with the `renouncePauser`
 *  function removed to avoid fat-finger errors.
 *  We inherit from `Context` to keep this contract compatible with the Gas Station Network.
 * See https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/lifecycle/Pausable.sol
 * See https://docs.openzeppelin.com/contracts/2.x/gsn#_msg_sender_and_msg_data
 */
export class PausableWithoutRenounce {
   
    _paused: bool;

    /**
     * @dev Initializes the contract in unpaused state. Assigns the Pauser role
     * to the deployer.
     */
    initialize(sender: string): void {
        initializer();
        new PauserRoleWithoutRenounce().initialize(sender);
        this._paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    paused(): bool {
        return this._paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    whenNotPaused(): void {
        assert(!this._paused, "Pausable: paused");
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    whenPaused(): void {
        assert(this._paused, "Pausable: not paused");
    }

    /**
     * @dev Called by a pauser to pause, triggers stopped state.
     */
    pause(): void {
        new PauserRoleWithoutRenounce().onlyPauser();
        this.whenNotPaused();
        this._paused = true;
    }

    /**
     * @dev Called by a pauser to unpause, returns to normal state.
     */
    unpause(): void  {
        new PauserRoleWithoutRenounce().onlyPauser();
        this.whenPaused();
        this._paused = false;
    }
}