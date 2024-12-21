// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ZLSmartAccount.sol";

contract ZLSmartAccountFactory is Ownable {
    UpgradeableBeacon public beacon;

    event SmartAccountCreated(address indexed accountAddress);

    constructor(address _initBlueprint) {
        beacon = new UpgradeableBeacon(_initBlueprint);
        beacon.transferOwnership(msg.sender);
    }

    function createSmartAccount() external returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon),
            abi.encodeWithSelector(
                ZLSmartAccount.initialize.selector,
                address(this)
            )
        );
        emit SmartAccountCreated(address(proxy));
        return address(proxy);
    }

    function updateBlueprint(address _newBlueprint) external onlyOwner {
        beacon.upgradeTo(_newBlueprint);
    }
}
