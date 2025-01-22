// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

interface ITonProxyApp {
    struct SupplyParams {
        address asset;
        uint256 amount;
        address onBehalfOf;
        uint16 referralCode;
    }
}