// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract ZLSmartAccount is Initializable {
    address public owner;

    event Executed(address indexed target, uint256 value, bytes data);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function initialize(address _owner) public initializer {
        owner = _owner;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");
        emit Executed(target, value, data);
        return result;
    }

    receive() external payable {}
}
