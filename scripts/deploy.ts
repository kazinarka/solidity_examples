import {ethers} from "hardhat";

async function main() {
    const Token = await ethers.getContractFactory("Token");
    const DAI = await Token.deploy(1000000, "DAI", "DAI");
    const WETH = await Token.deploy(1000000, "Wrapped Ether", "WETH");

    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    const priceConsumer = await PriceConsumer.deploy();

    const ChainSwap = await ethers.getContractFactory("ChainlinkSwap", {
        libraries: { PriceConsumer: priceConsumer.address },
    });
    const chainSwap = await ChainSwap.deploy();

    await chainSwap.setPricefeed(
        DAI.address,
        "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
    );

    await chainSwap.setPricefeed(
        WETH.address,
        "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"
    );

    await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
    await WETH.approve(chainSwap.address, ethers.utils.parseEther("5"));

    await chainSwap.provideLiquidityBatch(
        [DAI.address, WETH.address],
        [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
    )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
