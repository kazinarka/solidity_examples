import {ethers} from "hardhat";
import {Network, router_factory} from "./utils/network";

const token1Address = "0x5fC58034C421a781DED8D04b3318eEa4eDa779e2";
const token2Address = "0x98278B7AE0317caC9ABf18E69113c777eeC778B5";

async function main() {
    let [signer] = await ethers.getSigners();

    // Get addresses of Pancakeswap contracts
    const [routerAddress, factoryAddress] = router_factory(Network.ETH_Mainnet);

    // Derive Pancakeswap  contract, that store and create token pair
    //https://github.com/pancakeswap/pancake-smart-contracts/blob/master/projects/exchange-protocol/contracts/PancakeFactory.sol
    const factory = await ethers.getContractAt("Factory", factoryAddress);

    // Derive Pancakeswap  contract, that creates new liquidity
    //https://github.com/pancakeswap/pancake-smart-contracts/blob/master/projects/exchange-protocol/contracts/PancakeRouter.sol
    const router = await ethers.getContractAt("Router", routerAddress);

    // Get existing tokens
    const token1 = await ethers.getContractAt("Token1", token1Address);
    const token2 = await ethers.getContractAt("Token2", token2Address);

    // approve transfer of tokens to the router
    let approve1_tx = await token1.approve(router.address, 10000);
    await approve1_tx.wait(1);

    let approve2_tx = await token2.approve(router.address, 10000);
    await approve2_tx.wait(1);

    // Create tokens pair and new Liquidity
    let liquidity_tx = await router.addLiquidity(
        token1.address,
        token2.address,
        10000,
        10000,
        10000,
        10000,
        signer.address,
        Math.floor(Date.now() / 1000) + 60 * 10
    );
    await liquidity_tx.wait(1);

    // Get tokens pair from factory and check balance
    const pairAddress = await factory.getPair(token1.address, token2.address);
    console.log("Pair$", pairAddress);

    const pair = await ethers.getContractAt("Pair", pairAddress);

    const balance = await pair.balanceOf(signer.address);
    console.log(`balance LP: ${balance.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
