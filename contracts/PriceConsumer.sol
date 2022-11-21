pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConsumer {

    function getLatestPrice(address priceFeed) internal view returns (uint) {
        (
        ,
        int price,
        ,
        ,

        ) = AggregatorV3Interface(priceFeed).latestRoundData();
        require(price > 0, "Price of token is/below zero!");
        return uint256(price);
    }

    function getSwapBuyForSell (address tokenToBuyPricefeed, address tokenToSellPricefeed, uint256 amountOfTokenToBuy, uint256 feePercentage) external view returns(uint256 amountOfTokenToSell, uint256 fee) {
        uint256 tokenToBuyPrice = getLatestPrice(tokenToBuyPricefeed);
        uint256 tokenToSellPrice = getLatestPrice(tokenToSellPricefeed);

        amountOfTokenToSell = (amountOfTokenToBuy * tokenToBuyPrice) / tokenToSellPrice;

        require (amountOfTokenToSell > 0, "Amount unpayable");

        require(
            feePercentage >= 1000 || feePercentage == 0,
            "Fee percentage must be above 1000 or 0"
        );
        feePercentage > 0 && feePercentage != 1000
        ? fee = ((amountOfTokenToSell * feePercentage) / 1000) - amountOfTokenToSell
        : fee = 0;
    }

    function getSwapSellForBuy (address tokenToBuyPricefeed, address tokenToSellPricefeed, uint256 amountOfTokenToSell, uint256 feePercentage) external view returns(uint256 amountOfTokenToBuy, uint256 fee) {
        uint256 tokenToBuyPrice = getLatestPrice(tokenToBuyPricefeed);
        uint256 tokenToSellPrice = getLatestPrice(tokenToSellPricefeed);

        amountOfTokenToBuy = (tokenToSellPrice * amountOfTokenToSell) / tokenToBuyPrice;

        require (amountOfTokenToBuy > 0, "Amount unpayable");

        require(
            feePercentage >= 1000 || feePercentage == 0,
            "Fee percentage must be above 1000 or 0"
        );
        feePercentage > 0 && feePercentage != 1000
        ? fee = ((amountOfTokenToBuy * feePercentage) / 1000) - amountOfTokenToBuy
        : fee = 0;
    }
}
