import {ethers} from "hardhat";

async function main() {
    let [signer] = await ethers.getSigners();

    const factoryAddress = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";
    const factory = await ethers.getContractAt("Factory", factoryAddress);

    const routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    const router = await ethers.getContractAt("Router", routerAddress);


    const token1Address = "0x5fC58034C421a781DED8D04b3318eEa4eDa779e2";
    const token1 = await ethers.getContractAt("Token1", token1Address);

    const token2Address = "0x98278B7AE0317caC9ABf18E69113c777eeC778B5";
    const token2 = await ethers.getContractAt("Token2", token2Address);

    console.log("")
    // const pairAddress = await factory.createPair.call(factory,token1.address, token2.address);
    // const tx = await factory.createPair(token1.address, token2.address);
    // await tx.wait(1);
    // console.log("TX$", tx);
    // const pairAddress = await factory.getPair(token1.address, token2.address);
    // console.log("Pair$", pairAddress);
    // const contract = "0xE6c8C135fb1342EB26580b36872718df1a0A5Bb1";
    // const liquidity = await ethers.getContractAt("CreateLiquidity", contract);

    const liquidity_contract = await ethers.getContractFactory("CreateLiquidity");
    let liquidity = await liquidity_contract.deploy(factory.address, router.address);
    await liquidity.deployed();
    console.log("CONTRACT",liquidity.address);

    let approve1_tx = await token1.approve(liquidity.address, 10000);
    await approve1_tx.wait(1);
    console.log(`token 1 ${token1.address} `);
    let approve2_tx = await token2.approve(liquidity.address, 10000);
    await approve2_tx.wait(1);
    console.log(`token 2 ${token2.address} `);
    // const tx = await factory.createPair(token1.address, token2.address);
    // await tx.wait(1);
    //
    // console.log(`step 3`);
    let liquidity_tx = await liquidity.createLiquidity(
        token1.address,
        token2.address,
        10000,
        10000,
        10000,
        10000,
        Math.floor(Date.now() / 1000) + 60 * 10
    );
    await liquidity_tx.wait(1);

    console.log("step 4 ");
    const pairAddress = await factory.getPair(token1.address, token2.address);
    console.log("Pair$", pairAddress);
    //
    // const pair = await ethers.getContractAt("Pair", pairAddress);
    //
    // const balance = await pair.balanceOf(signer.address);
    // console.log(`balance LP: ${balance.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
