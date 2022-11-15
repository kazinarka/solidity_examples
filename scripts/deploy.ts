import {ethers} from "hardhat";

async function main() {
    let [signer] = await ethers.getSigners();

    const factoryAddress = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";
    const factory = await ethers.getContractAt("Factory", factoryAddress);

    const routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    const router = await ethers.getContractAt("Router", routerAddress);

    console.assert(router.address,"0xD99D1c33F9fC3444f8101754aBC46c52416550D1");

    const token1Factory = await ethers.getContractFactory("Token1");
    let token1 = await token1Factory.deploy();
    await token1.deployed();
    console.log(`Token1 Deployed at:${token1.address}`)

    const token2Factory = await ethers.getContractFactory("Token2");
    let token2 = await token2Factory.deploy();
    await token2.deployed();
    console.log(`Token2 Deployed at:${token2.address}`)

    // const pairAddress = await factory.createPair.call(factory,token1.address, token2.address);
    const tx = await factory.createPair(token1.address, token2.address);
    const pairAddress = await factory.getPair(token1.address, token2.address);

    await token1.approve(router.address, 10000);
    await token2.approve(router.address, 10000);

    await router.addLiquidity(
        token1.address,
        token2.address,
        10000,
        10000,
        10000,
        10000,
        signer.address,
        Math.floor(Date.now() / 1000) + 60 * 10
    );

    const pair = await ethers.getContractAt("Pair", pairAddress);

    const balance = await pair.balanceOf(signer.address);
    console.log(`balance LP: ${balance.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
