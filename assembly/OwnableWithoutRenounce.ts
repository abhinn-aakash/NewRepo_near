
import { Context, logging, u256 } from "near-sdk-as";
import * as Initializable from "./Initializable";

export class OwnableWithoutRenounce {
    _owner: string;

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor(sender: string) {
        logging.log("contract ownership setting started.");
        // Initializable.initializer();
        this._owner = sender;
        logging.log("contract's owner setup done.");
    }

    /**
     * @return the address of the owner.
     */
    owner(): string {
        return this._owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    onlyOwner(): number {
        return assert(this.isOwner(), "Only owner can perform the operation");
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    isOwner(): bool {
        return Context.sender == this._owner;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    transferOwnership(newOwner: string): void {
        if (Context.sender == this._owner) this._transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    _transferOwnership(newOwner: string): void {
        assert(newOwner != '0x0');
        this._owner = newOwner;
    }
}