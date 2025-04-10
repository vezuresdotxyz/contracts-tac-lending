// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
interface IPoolProxy {
    struct SupplyArguments {
        address asset;
        uint256 amount;
        address onBehalfOf;
        uint16 referralCode;
    }

    struct WithdrawArguments {
        address asset;
        uint256 amount;
        address to;
    }

    struct BorrowArguments {
        address asset;
        uint256 amount;
        uint256 interestRateMode;
        uint16 referralCode;
        address onBehalfOf;
    }

    struct RepayArguments {
        address asset;
        uint256 amount;
        uint256 interestRateMode;
        address onBehalfOf;
    }
}
