import {ethers} from "hardhat";
import {Network, router_factory} from "./utils/network"
import {address} from "hardhat/internal/core/config/config-validation";

async function main() {
    let [signer] = await ethers.getSigners();

    // Get addresses of Pancakeswap contracts
    const [routerAddress,factoryAddress] = router_factory(Network.Testnet);

    // Derive Pancakeswap  contract, that store and create token pair
    //https://github.com/pancakeswap/pancake-smart-contracts/blob/master/projects/exchange-protocol/contracts/PancakeFactory.sol
    const factory = await ethers.getContractAt("Factory", factoryAddress);

    // Derive Pancakeswap  contract, that creates new liquidity
    //https://github.com/pancakeswap/pancake-smart-contracts/blob/master/projects/exchange-protocol/contracts/PancakeRouter.sol
    const router = await ethers.getContractAt("Router", routerAddress);

    if ( await ethers.provider.getCode("Token1") === ethers.constants.AddressZero) {

        const token1Factory = await ethers.getContractFactory("Token1");
        let token1 = await token1Factory.deploy();
        await token1.deployed();
        console.log(`Token1 Deployed at:${token1.address}`)
    }

    const token2Factory = await ethers.getContractFactory("Token2");
    let token2 = await token2Factory.deploy();
    await token2.deployed();
    console.log(`Token2 Deployed at:${token2.address}`)

    // const pairAddress = await factory.createPair.call(factory,token1.address, token2.address);
    // const tx = await factory.createPair(token1.address, token2.address);
    // await tx.wait(1);
    // console.log("TX$", tx);


    let approve1_tx = await token1.approve(router.address, 10000);
    await approve1_tx.wait(1);

    let approve2_tx = await token2.approve(router.address, 10000);
    await approve2_tx.wait(1);

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

    const pairAddress = await factory.getPair(token1.address, token2.address);
    console.log("Pair$", pairAddress);
    await liquidity_tx.wait(1);

    const pair = await ethers.getContractAt("Pair", pairAddress);

    const balance = await pair.balanceOf(signer.address);
    console.log(`balance LP: ${balance.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
