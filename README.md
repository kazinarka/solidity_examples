# Create liquidity pool on PancakeSwap example

This project demonstrates how to create a liquidity pool at PancakeSwap via code.

Solidity contracts code
> contracts/

Typescript scripts code
> scripts/
 
Typescript tests code
> test/

# Setup guide

Need to create .env file and add following:
> ALCHEMY_PROVIDER=<PROVIDER>

Compile all contracts and create artifacts
> npx hardhat compile

Run script that will deploy 2 custom token contracts, deploy ChainlinkSwap contract and create liquidity pool at ChainlinkSwap
> npx hardhat run scripts/deploy.ts

You can specialize network while launching script via 
> --network <network_name>

Example
> npx hardhat run scripts/deploy.ts --network mainnet

# Main functions

Anybody can get the price feed of token
> tokenToPricefeed(address tokenAddress)

Anybody can get default swap fee
> getSwapFee

Anybody can get swap fee for a token
> getTokenFee(address tokenAddress)

Owner can map token with price feed and add it to contract
> setPricefeed( address tokenAddress, address pricefeedAddress )

Owner can change default swap fee
> changeDefaultSwapfee(uint256 newFee)

Owner can change swap fee of a token
> changeTokenSwapFee(address tokenAddress, uint256 newFee)

Owner can provide liquidity of a token
> provideLiquidity(address tokenAddress, uint256 amount)

Owner can provide liquidity of several tokens in one transaction
> provideLiquidityBatch(address[] calldata tokenAddress, uint256[] calldata amount)

Owner can withdraw liquidity of a token
> withdrawLiquidity(address tokenAddress, uint256 amount)

Owner can withdraw liquidity of several tokens in one transaction
> withdrawLiquidityBatch(address[] calldata tokenAddress, uint256[] calldata amount)

Anybody can swap tokens, providing amount of tokens you want to get by swap
> swapBuyForSell(address tokenToBuy, address tokenToSell, uint256 amountOfTokenToBuy)

Anybody can swap tokens, providing amount of tokens you want to spent by swap
> swapSellForBuy(address tokenToSell, address tokenToBuy, uint256 amountOfTokenToSell)