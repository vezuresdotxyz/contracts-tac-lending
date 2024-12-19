// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IZerolendLendingPool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
    function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) external returns (uint256);
}

contract JettonProxyZerolend {
    address public lendingPool; // Address of the Zerolend LendingPool contract
    constructor(address _lendingPool) {
        lendingPool = _lendingPool;
    }
    // Deposit ERC-20 tokens into Zerolend
    function depositToZerolend(address asset, uint256 amount, address user) external {
        require(amount > 0, "Amount must be greater than 0");
        // Transfer tokens from the user to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        // Approve the lending pool to spend the tokens
        IERC20(asset).approve(lendingPool, amount);
        // Deposit the tokens into Zerolend
        IZerolendLendingPool(lendingPool).deposit(asset, amount, user, 0);
    }
    
    // Withdraw ERC-20 tokens from Zerolend
    function withdrawFromZerolend(address asset, uint256 amount, address user) external {
        require(amount > 0, "Amount must be greater than 0");
        // Withdraw the tokens from Zerolend
        IZerolendLendingPool(lendingPool).withdraw(asset, amount, user);
    }

    // Borrow ERC-20 tokens from Zerolend
    function borrowFromZerolend(address asset, uint256 amount, uint256 interestRateMode, address user) external {
        require(amount > 0, "Amount must be greater than 0");
        // Borrow the tokens from Zerolend
        IZerolendLendingPool(lendingPool).borrow(asset, amount, interestRateMode, 0, user);
    }

    // Repay borrowed ERC-20 tokens to Zerolend
    function repayToZerolend(address asset, uint256 amount, uint256 rateMode, address user) external {
        require(amount > 0, "Amount must be greater than 0");
        // Transfer tokens from the user to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        // Approve the lending pool to spend the tokens
        IERC20(asset).approve(lendingPool, amount);
        // Repay the tokens to Zerolend
        uint256 repaid = IZerolendLendingPool(lendingPool).repay(asset, amount, rateMode, user);
        require(repaid > 0, "Repayment failed");
    }
}