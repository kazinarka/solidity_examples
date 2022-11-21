pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(
        uint256 initialSupply,
        string memory tokenName,
        string memory symbol
    ) ERC20(tokenName, symbol) {
        _mint(msg.sender, initialSupply * 1e18) ;
    }
}
