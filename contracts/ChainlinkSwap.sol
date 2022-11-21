pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PriceConsumer.sol";

contract ChainlinkSwap is Ownable {
    using PriceConsumer for address;

    uint256 internal swapFee = 1030;

    mapping(address => address) internal _tokenToPricefeed;

    mapping(address => uint256) internal _tokenSwapFee;

    mapping(address => bool) internal _blacklisted;

    event TokenSwapped(address indexed tokenBought, address indexed tokenSold, uint256 amountBought, uint256 amountSold);
    event TokenMapped(address indexed tokenAddress, address indexed pricefeedAddress);
    event LiquidityProvided(address indexed tokenAddress, uint256 indexed amount, address provider);
    event LiquidityWithdrawn(address indexed tokenAddress, uint256 indexed amount, address withdrawnTo);
    event BlacklistStateChanged(address indexed blacklistedAddress, bool indexed newState, address blacklister);
    event SwapFeeChanged(uint256 indexed newFee, address owner);
    event TokenSwapFeeChanged(address indexed tokenAddress, uint256 indexed newFee, address owner);

    function tokenToPricefeed (address tokenAddress) external view returns (address) {
        return _tokenToPricefeed[tokenAddress];
    }

    function blacklisted (address userAddress) external view returns (bool) {
        return _blacklisted[userAddress];
    }

    function getSwapFee () external view returns (uint256) {
        return swapFee;
    }

    function getTokenFee (address tokenAddress) external view returns (uint256) {
        return _tokenSwapFee[tokenAddress];
    }

    function setPricefeed ( address tokenAddress, address pricefeedAddress ) external onlyOwner {
        _tokenToPricefeed[tokenAddress] = pricefeedAddress;
        emit TokenMapped(tokenAddress, pricefeedAddress);
    }

    function changeDefaultSwapfee (uint256 newFee) external onlyOwner {
        require(
            newFee > 1000 || newFee == 0,
            "Fee percentage must be above 1000"
        );
        swapFee = newFee;
        emit SwapFeeChanged(newFee, msg.sender);
    }

    function changeTokenSwapFee (address tokenAddress, uint256 newFee) external onlyOwner {
        require(_tokenToPricefeed[tokenAddress] != address(0), 'token not mapped');
        require(
            newFee > 1000 || newFee == 0,
            "Fee percentage must be above 1000"
        );
        _tokenSwapFee[tokenAddress] = newFee;
        emit TokenSwapFeeChanged(tokenAddress, newFee, msg.sender);
    }

    function blacklistUser (address userAddress) external onlyOwner {
        require(!_blacklisted[userAddress]);
        _blacklisted[userAddress] = true;
        emit BlacklistStateChanged(userAddress, true, msg.sender);
    }

    function unblacklistUser (address userAddress) external onlyOwner {
        require(_blacklisted[userAddress]);
        _blacklisted[userAddress] = false;
        emit BlacklistStateChanged(userAddress, false, msg.sender);
    }

    function provideLiquidity (address tokenAddress, uint256 amount) public onlyOwner {
        require(amount > 0, 'cannot transfer 0');
        require(_tokenToPricefeed[tokenAddress] != address(0), 'address is not mapped');
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        require(success, 'deposit failed');
        emit LiquidityProvided(tokenAddress, amount, msg.sender);
    }

    function provideLiquidityBatch (address[] calldata tokenAddress, uint256[] calldata amount) external {
        require(tokenAddress.length == amount.length, "length mismatch");
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            provideLiquidity(tokenAddress[i], amount[i]);
        }
    }

    function withdrawLiquidity (address tokenAddress, uint256 amount) public onlyOwner {
        require(amount > 0, 'cannot withdraw 0');
        require(_tokenToPricefeed[tokenAddress] != address(0), 'address is not mapped');
        bool success = IERC20(tokenAddress).transfer(msg.sender, amount);
        require(success, 'withdraw failed');
        emit LiquidityWithdrawn(tokenAddress, amount, msg.sender);
    }

    function withdrawLiquidityBatch (address[] calldata tokenAddress, uint256[] calldata amount) external {
        require(tokenAddress.length == amount.length, "length mismatch");
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            withdrawLiquidity(tokenAddress[i], amount[i]);
        }
    }

    function swapBuyForSell (address tokenToBuy, address tokenToSell, uint256 amountOfTokenToBuy) external {
        require(!_blacklisted[msg.sender] && !_blacklisted[tx.origin], 'sender or origin blacklisted');
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

    function swapSellForBuy (address tokenToSell, address tokenToBuy, uint256 amountOfTokenToSell) external {
        require(!_blacklisted[msg.sender] && !_blacklisted[tx.origin], 'sender or origin blacklisted');
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
