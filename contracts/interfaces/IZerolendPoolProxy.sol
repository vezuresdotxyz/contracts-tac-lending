// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

interface IZerolendPoolProxy {
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
