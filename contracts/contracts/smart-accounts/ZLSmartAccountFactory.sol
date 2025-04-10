// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ZLSmartAccount} from "./ZLSmartAccount.sol";

contract ZLSmartAccountFactory is OwnableUpgradeable {
    UpgradeableBeacon public beacon;

    event SmartAccountCreated(address indexed accountAddress);

    constructor(address _initBlueprint) {
        beacon = new UpgradeableBeacon(_initBlueprint, msg.sender);
        beacon.transferOwnership(msg.sender);
    }

    function createSmartAccount() external returns (address) {
        BeaconProxy proxy =
            new BeaconProxy(address(beacon), abi.encodeWithSelector(ZLSmartAccount.initialize.selector, address(this)));
        emit SmartAccountCreated(address(proxy));
        return address(proxy);
    }

    function updateBlueprint(address _newBlueprint) external onlyOwner {
        beacon.upgradeTo(_newBlueprint);
    }
}
