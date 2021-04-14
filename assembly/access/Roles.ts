/**
 * @title Role
 * @dev class for managing role struct
 */

import { PersistentMap } from "near-sdk-core";

let bearer = new PersistentMap<string, bool>("be:");

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */

/**
 * @dev give an account access to this role
 */
export function add(account: string): void {
    assert(account != '0');
    assert(!has(account));
    bearer.set(account, true);
}

/**
 * @dev remove an account's access to this role
 */
export function remove(account: string): void {
    assert(account != "0");
    assert(has(account));
    bearer.set(account, false);
}

/**
 * @dev check if an account has this role
 * @return bool
 */
export function has(account: string): bool {
    assert(account != "0");
    return bearer.getSome(account);
}