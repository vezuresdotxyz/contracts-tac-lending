// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
}

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract TonProxyApp {
    IPool public pool = IPool(0x927b3A8e5068840C9758b0b88207b28aeeb7a3fd);
    function supply(address token, address to, uint256 amount) external {
        IERC20(token).approve(address(pool), amount);
        pool.supply(token, amount, to, 0);
    }
}
