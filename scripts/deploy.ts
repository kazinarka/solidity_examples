import {ethers} from "hardhat";

async function main() {
    let [signer] = await ethers.getSigners();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
