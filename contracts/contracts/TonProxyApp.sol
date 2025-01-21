// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ICrossChainLayer} from "tac-l2-ccl/contracts/interfaces/ICrossChainLayer.sol";
import {OutMessage, TacHeaderV1, TokenAmount} from "tac-l2-ccl/contracts/L2/Structs.sol";
import {TacProxyV1} from "tac-l2-ccl/contracts/proxies/TacProxyV1.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
}

interface ISmartAccount {
    function initialize(address _owner) external;
}

contract TonProxyApp is TacProxyV1, OwnableUpgradeable {
    IPool public pool;
    UpgradeableBeacon public beacon;

    mapping(bytes32 => address) public smartAccounts;

    ICrossChainLayer public immutable crossChainLayer;

    event InvokeWithCallback(
        uint64 queryId,
        uint256 timestamp,
        string operationId,
        string tvmCaller,
        bytes extraData,
        TokenAmount[] receivedTokens
    );

    event SmartAccountCreated(address indexed accountAddress);

    modifier onlyCrossChainLayer() {
        require(msg.sender == address(crossChainLayer), "Only the CrossChainLayer can call this function");
        _;
    }

    function initialize(address _initBlueprint, address _pool) public initializer {
        pool = IPool(_pool);
        beacon = new UpgradeableBeacon(_initBlueprint, msg.sender);
    }

    constructor(ICrossChainLayer _crossChainLayer) {
        crossChainLayer = _crossChainLayer;
    }

    function invokeWithCallback(bytes calldata tacHeader, bytes calldata arguments) external onlyCrossChainLayer {
        // Decode the header
        TacHeaderV1 memory header = _decodeTacHeader(tacHeader);

        // Decode the token list
        TokenAmount[] memory receivedTokens = abi.decode(arguments, (TokenAmount[]));

        // then we can call dapp contract

        // Emit the event (optional - for your internal logging)
        emit InvokeWithCallback(
            header.queryId, header.timestamp, header.operationId, header.tvmCaller, header.extraData, receivedTokens
        );

        // Approve and send tokens back through the cross-chain layer
        for (uint256 i = 0; i < receivedTokens.length; i++) {
            IERC20(receivedTokens[i].l2Address).approve(address(crossChainLayer), receivedTokens[i].amount);
        }

        crossChainLayer.sendMessage(OutMessage(header.queryId, header.tvmCaller, "", receivedTokens));
    }

    function supply(address token, uint256 amount) external {
        address to = _getOrCreateSmartAccount("test");
        IERC20(token).approve(address(pool), amount);
        pool.supply(token, amount, to, 0);
    }

    function updateBlueprint(address _newBlueprint) external onlyOwner {
        beacon.upgradeTo(_newBlueprint);
    }

    /// @dev tvmWallet is the address of the TON wallet
    function _getOrCreateSmartAccount(string memory tvmWallet) internal returns (address) {
        bytes32 id = keccak256(abi.encodePacked(tvmWallet));
        if (smartAccounts[id] != address(0)) {
            return smartAccounts[id];
        }

        address account = _createSmartAccount();
        smartAccounts[id] = account;
        return account;
    }

    function _createSmartAccount() internal onlyOwner returns (address) {
        BeaconProxy proxy =
            new BeaconProxy(address(beacon), abi.encodeWithSelector(ISmartAccount.initialize.selector, address(this)));
        emit SmartAccountCreated(address(proxy));
        return address(proxy);
    }
}
