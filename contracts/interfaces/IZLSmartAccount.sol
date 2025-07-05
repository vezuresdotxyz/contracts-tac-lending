// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TokenAmount, NFTAmount} from "@tonappchain/evm-ccl/contracts/core/Structs.sol";
interface IZLSmartAccount {
    function execute(address target, uint256 value, bytes calldata data) payable external returns(bytes memory);
}
