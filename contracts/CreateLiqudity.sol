pragma solidity ^0.8.0;


import "./Factory.sol";
import "./Router.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "hardhat/console.sol";

contract CreateLiquidity
{
    Factory private factory;
    Router private router;

    constructor(address _factory, address _router)
    {
        factory = Factory(_factory);
        router = Router(_router);

    }

    function createLiquidity(
        ERC20 tokenA,
        ERC20 tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        uint deadline
    ) external  returns (address)
    {


//        uint allowance_a = tokenA.allowance(msg.sender, address(this));
//        uint allowance_b = tokenB.allowance(msg.sender, address(this));

//        require(allowance_a == amountADesired
//            && allowance_b == amountBDesired,
//            "Not enough tokens");


//        tokenA.transferFrom(msg.sender, address(this), amountADesired);
//
//        tokenB.transferFrom(msg.sender, address(this), amountBDesired);

        tokenA.approve(address (router), amountADesired);

        tokenB.approve(address (router), amountBDesired);
//
        address pair_address = factory.getPair(address (tokenA),address (tokenB));
        if (pair_address == address(0)) {
           address pair_address = factory.createPair(address (tokenA), address (tokenB));
        }
        router.addLiquidity(
            address (tokenA),
            address (tokenB),
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            msg.sender,
            deadline
        );
        return pair_address;
    }
//    receive() external payable {}
}
