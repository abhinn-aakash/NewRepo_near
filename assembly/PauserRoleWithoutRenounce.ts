/**
 * @title PauserRoleWithoutRenounce
 * @author Sablier
 * @notice Fork of OpenZeppelin's PauserRole, but with the `renouncePauser` function removed to avoid fat-finger errors.
 *  We inherit from `Context` to keep this contract compatible with the Gas Station Network.
 * See https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/access/roles/PauserRole.sol
 */

import { Context } from "near-sdk-core";
import { add, has, remove } from "./access/Roles";
import { initializer } from "./Initializable";

export class PauserRoleWithoutRenounce {
    // using Roles for Roles.Role;


    // _pausers: Role;

    initialize(sender: string): void {
        initializer();
        if (!this.isPauser(sender)) {
            this._addPauser(sender);
        }
    }

    onlyPauser(): void {
        assert(this.isPauser(Context.sender), "PauserRole: caller does not have the Pauser role");
    }

    isPauser(account: string): bool{
        return has(account);
    }

    addPauser(account: string): void {
        this.onlyPauser();
        this._addPauser(account);
    }

    _addPauser(account: string): void {
        add(account);
    }

    _removePauser(account: string): void {
        remove(account);
    }

    //  ______gap: Uint32Array[50];
}