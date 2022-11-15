import {ethers} from "hardhat";

async function main() {
    let [signer] = await ethers.getSigners();

    const factoryAddress = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";
    const factory = await ethers.getContractAt("Factory", factoryAddress);

    const routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    const router = await ethers.getContractAt("Router", routerAddress);

    console.assert(router.address, "0xD99D1c33F9fC3444f8101754aBC46c52416550D1");

    const token1Address = "0x240a0495f88929B5118f06965490D20f3da17F63";
    const token1 = await ethers.getContractAt("Token1", token1Address);

    const token2Address = "0xb674A951142050C7dbAda0AF8944123bb3B6051D";
    const token2 = await ethers.getContractAt("Token2", token2Address);

    // const pairAddress = await factory.createPair.call(factory,token1.address, token2.address);
    // const tx = await factory.createPair(token1.address, token2.address);
    // await tx.wait(1);
    // console.log("TX$", tx);
    const pairAddress = await factory.getPair(token1.address, token2.address);
    console.log("Pair$", pairAddress);

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
    await liquidity_tx.wait(1);

    const pair = await ethers.getContractAt("Pair", pairAddress);

    const balance = await pair.balanceOf(signer.address);
    console.log(`balance LP: ${balance.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
