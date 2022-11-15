pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token2 is ERC20 {
    constructor() ERC20('Token_lp 2', 'LP2') {
        _mint(msg.sender, 1000000000000000000000000);
    }
}
