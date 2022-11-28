pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PriceConsumer.sol";

contract ChainlinkSwap is Ownable {
    using PriceConsumer for address;

    // fees that go to protocol owner.
    // default is 0.3% (1030/1000)
    // denominated in 1000s for safer divisions
    uint256 internal swapFee = 1030;

    // mapping of supported assets to its chainlink pricefeed
    mapping(address => address) internal _tokenToPricefeed;

    // mapping of supported assets to their individual fees, if not set, swapFee will be used
    // to set to 0, simply set the particular assets fee to 1000
    mapping(address => uint256) internal _tokenSwapFee;

    // Events
    event TokenSwapped(address indexed tokenBought, address indexed tokenSold, uint256 amountBought, uint256 amountSold);
    event TokenMapped(address indexed tokenAddress, address indexed pricefeedAddress);
    event LiquidityProvided(address indexed tokenAddress, uint256 indexed amount, address provider);
    event LiquidityWithdrawn(address indexed tokenAddress, uint256 indexed amount, address withdrawnTo);
    event SwapFeeChanged(uint256 indexed newFee, address owner);
    event TokenSwapFeeChanged(address indexed tokenAddress, uint256 indexed newFee, address owner);

    // show dedicated chainlink pricefeed of the token
    function tokenToPricefeed (address tokenAddress) external view returns (address) {
        return _tokenToPricefeed[tokenAddress];
    }

    // returns the current swapFee
    function getSwapFee () external view returns (uint256) {
        return swapFee;
    }

    // returns the current swapFee of token
    function getTokenFee (address tokenAddress) external view returns (uint256) {
        return _tokenSwapFee[tokenAddress];
    }

    // map the token with pricefeed
    function setPricefeed ( address tokenAddress, address pricefeedAddress ) external onlyOwner {
        _tokenToPricefeed[tokenAddress] = pricefeedAddress;
        emit TokenMapped(tokenAddress, pricefeedAddress);
    }

    // change default swap fee
    // note - should never be set to any value below 1000 except 0, both of which indicate no fees.
    function changeDefaultSwapfee (uint256 newFee) external onlyOwner {
        require(
            newFee > 1000 || newFee == 0,
            "Fee percentage must be above 1000"
        );
        swapFee = newFee;
        emit SwapFeeChanged(newFee, msg.sender);
    }

    // change swap fee of a token
    // note - should never be set to any value below 1000 except 0, however both do not necessarily indicate no fees.
    //        setting the value to 0 will mean that @swapFee will be used for fees while setting the value to 1000 will
    //        mean @tokenSwapFee will be used and hence no fees.
    function changeTokenSwapFee (address tokenAddress, uint256 newFee) external onlyOwner {
        require(_tokenToPricefeed[tokenAddress] != address(0), 'token not mapped');
        require(
            newFee > 1000 || newFee == 0,
            "Fee percentage must be above 1000"
        );
        _tokenSwapFee[tokenAddress] = newFee;
        emit TokenSwapFeeChanged(tokenAddress, newFee, msg.sender);
    }

    // provide liquidity of the token to contract
    // requirements - amount should be greater than 0
    //                tokenAddress should be mapped
    function provideLiquidity (address tokenAddress, uint256 amount) public onlyOwner {
        require(amount > 0, 'cannot transfer 0');
        require(_tokenToPricefeed[tokenAddress] != address(0), 'address is not mapped');
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        require(success, 'deposit failed');
        emit LiquidityProvided(tokenAddress, amount, msg.sender);
    }

    // provide liquidity of tokens to contract
    // requirements - length of the tokenAddress and amount arrays should be the same
    function provideLiquidityBatch (address[] calldata tokenAddress, uint256[] calldata amount) external {
        require(tokenAddress.length == amount.length, "length mismatch");
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            provideLiquidity(tokenAddress[i], amount[i]);
        }
    }

    // withdraw liquidity of the token to owner wallet
    // requirements - amount should be greater than 0
    //                tokenAddress should be mapped
    function withdrawLiquidity (address tokenAddress, uint256 amount) public onlyOwner {
        require(amount > 0, 'cannot withdraw 0');
        require(_tokenToPricefeed[tokenAddress] != address(0), 'address is not mapped');
        bool success = IERC20(tokenAddress).transfer(msg.sender, amount);
        require(success, 'withdraw failed');
        emit LiquidityWithdrawn(tokenAddress, amount, msg.sender);
    }

    // withdraw liquidity of tokens to owner wallet
    // requirements - length of the tokenAddress and amount arrays should be the same
    function withdrawLiquidityBatch (address[] calldata tokenAddress, uint256[] calldata amount) external {
        require(tokenAddress.length == amount.length, "length mismatch");
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            withdrawLiquidity(tokenAddress[i], amount[i]);
        }
    }

    // swap unknown amount of "sell" tokens with known amount of "buy" tokens
    function swapBuyForSell (address tokenToBuy, address tokenToSell, uint256 amountOfTokenToBuy) external {
        address tokenToBuyPricefeed = _tokenToPricefeed[tokenToBuy];
        address tokenToSellPricefeed = _tokenToPricefeed[tokenToSell];
        require (tokenToBuyPricefeed != address(0) && tokenToSellPricefeed != address(0), "token not mapped");
        require (amountOfTokenToBuy > 0, "cannot buy 0");
        require (IERC20(tokenToBuy).balanceOf(address(this)) >= amountOfTokenToBuy, "Insufficient liquidity");

        uint256 trueFee;
        _tokenSwapFee[tokenToSell] > 0 ?
        trueFee = _tokenSwapFee[tokenToSell]
        :
        trueFee = swapFee;


        (uint256 amountOfTokenToSell, uint256 fee) = tokenToBuyPricefeed.getSwapBuyForSell(tokenToSellPricefeed, amountOfTokenToBuy, trueFee);

        uint256 newAmountOfTokenToSell = amountOfTokenToSell + fee;

        bool sellSuccess = IERC20(tokenToSell).transferFrom(msg.sender, address(this), newAmountOfTokenToSell);
        require (sellSuccess, "sellSucess failed");

        bool buySuccess = IERC20(tokenToBuy).transfer(msg.sender, amountOfTokenToBuy);
        require (buySuccess, "buySuccess failed");

        emit TokenSwapped(tokenToBuy, tokenToSell, amountOfTokenToBuy, newAmountOfTokenToSell);
    }

    // swap known amount of "sell" tokens with unknown amount of "buy" tokens
    function swapSellForBuy (address tokenToSell, address tokenToBuy, uint256 amountOfTokenToSell) external {
        address tokenToBuyPricefeed = _tokenToPricefeed[tokenToBuy];
        address tokenToSellPricefeed = _tokenToPricefeed[tokenToSell];
        require (tokenToBuyPricefeed != address(0) && tokenToSellPricefeed != address(0), "token not mapped");
        require (amountOfTokenToSell > 0, "cannot sell 0");

        uint256 trueFee;
        _tokenSwapFee[tokenToBuy] > 0 ?
        trueFee = _tokenSwapFee[tokenToBuy]
        :
        trueFee = swapFee;

        (uint256 amountOfTokenToBuy, uint256 fee) = tokenToBuyPricefeed.getSwapSellForBuy(tokenToSellPricefeed, amountOfTokenToSell, trueFee);
        require (IERC20(tokenToBuy).balanceOf(address(this)) >= amountOfTokenToBuy, "Insufficient liquidity");

        uint256 newAmountOfTokenToBuy = amountOfTokenToBuy - fee;

        bool sellSuccess = IERC20(tokenToSell).transferFrom(msg.sender, address(this), amountOfTokenToSell);
        require (sellSuccess, "sellSuccess failed");

        bool buySuccess = IERC20(tokenToBuy).transfer(msg.sender, newAmountOfTokenToBuy);

        require (buySuccess, "buySuccess failed");

        emit TokenSwapped(tokenToBuy, tokenToSell, newAmountOfTokenToBuy, amountOfTokenToSell);
    }
}
