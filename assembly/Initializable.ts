
/**
 * @title Initializable
 *
 * @dev Helper contract to support initializer functions. To use it, replace
 * the constructor with a function that has the `initializer` modifier.
 * WARNING: Unlike constructors, initializer functions must be manually
 * invoked. This applies both to deploying an Initializable contract, as well
 * as extending an Initializable contract via inheritance.
 * WARNING: When used with inheritance, manual care must be taken to not invoke
 * a parent initializer twice, or ensure that all initializers are idempotent,
 * because this is not dealt with automatically as with constructors.
 */
// class Initializable {

  /**
   * @dev Indicates that the contract has been initialized.
   */
   let initialized: bool;

  /**
   * @dev Indicates that the contract is in the process of being initialized.
   */
  let initializing: bool;

  // Reserved storage space to allow for layout changes in the future.
  // let  ______gap;
  
  /**
   * @dev Modifier to use in the initializer function of a contract.
   */
  export function initializer(): void {
    assert(initializing || !initialized, "Contract instance has already been initialized");

    let isTopLevelCall: bool = !initializing;
    if (isTopLevelCall) {
      initializing = true;
      initialized = true;
    }

    if (isTopLevelCall) {
      initializing = false;
    }
  }

  /// @dev Returns true if and only if the function is running in the constructor
  // function isConstructor(): bool {
  //   // extcodesize checks the size of the code stored in an address, and
  //   // address returns the current address. Since the code is still not
  //   // deployed when running a constructor, any checks on its code size will
  //   // yield zero, making it an effective way to detect if a contract is
  //   // under construction or not.
  //   cs: u256;
  //   assembly { cs := extcodesize(address) }
  //   return cs == 0;
  // }

  

