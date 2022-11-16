# Create liquidity pool on PancakeSwap example

This project demonstrates how to create a liquidity pool at PancakeSwap via code.

Solidity contracts code
> contracts/

Typescript scripts code
> scripts/

# Setup guide

Need to create .env file and add following:
> PRIVATE_KEY="<your_private_key>";

Compile all contracts and create artifacts
> npx hardhat compile

Run script that will deploy 2 custom token contracts and create liquidity pool at PancakeSwap
> npx hardhat run scripts/deploy.ts

### Note: run next command only if you have already deployed tokens

You need to change tokens contracts addresses in `scripts/deplou_without_token.ts` - consts `token1Address` and `token2Address`

Run script that will use 2 custom token contracts that are already deployed and create liquidity pool at PancakeSwap
> npx hardhat run scripts/deploy_without_token.ts

You can specialize network while launching script via 
> --network <network_name>

Example
> npx hardhat run scripts/deploy.ts --network mainnet