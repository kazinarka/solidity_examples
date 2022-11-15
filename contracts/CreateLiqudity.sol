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
        IERC20 tokenA,
        IERC20 tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        uint deadline
    ) external payable returns (address)
    {

//        uint allowance_a = tokenA.allowance(msg.sender, address(this));
//        uint allowance_b = tokenB.allowance(msg.sender, address(this));
//
//        require(allowance_a == amountADesired
//            && allowance_b == amountBDesired,
//            "Not enough tokens");


//        tokenA._transfer(msg.sender, address(this), amountADesired);
//
//        tokenB._transfer(msg.sender, address(this), amountBDesired);

        console.log("Step 1 ");
        tokenA.approve(address (router), amountADesired);
        console.log("Step 2 ");
        tokenB.approve(address (router), amountBDesired);

        address pair_address = factory.getPair(address (tokenA), address (tokenB));

        if (pair_address == address(0)) {
            pair_address = factory.createPair(address (tokenA), address (tokenB));
        }
        console.log("Step 3 ");

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
    receive() external payable {}
}
