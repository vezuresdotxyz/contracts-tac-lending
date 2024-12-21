// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
}

interface ISmartAccount {
    function initialize(address _owner) external;
}

contract TonProxyApp is Ownable, Initializable {
    IPool public pool;
    UpgradeableBeacon public beacon;

    event SmartAccountCreated(address indexed accountAddress);

    function initialize(
        address _initBlueprint,
        address _pool
    ) public initializer {
        pool = IPool(_pool);
        beacon = new UpgradeableBeacon(_initBlueprint);
        beacon.transferOwnership(msg.sender);
    }

    function supply(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).approve(address(pool), amount);
        pool.supply(token, amount, to, 0);
    }

    function updateBlueprint(address _newBlueprint) external onlyOwner {
        beacon.upgradeTo(_newBlueprint);
    }

    function _createSmartAccount() dexternal onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon),
            abi.encodeWithSelector(
                ISmartAccount.initialize.selector,
                address(this)
            )
        );
        emit SmartAccountCreated(address(proxy));
        return address(proxy);
    }
}
