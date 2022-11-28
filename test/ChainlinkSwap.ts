import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ChainlinkSwap", function () {
    async function deployOneYearLockFixture() {
        let accounts = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        const DAI = await Token.deploy(1000000, "DAI", "DAI");
        const WETH = await Token.deploy(1000000, "Wrapped Ether", "WETH");

        const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
        const priceConsumer = await PriceConsumer.deploy();

        const ChainSwap = await ethers.getContractFactory("ChainlinkSwap", {
            libraries: { PriceConsumer: priceConsumer.address },
        });
        const chainSwap = await ChainSwap.deploy();

        return { DAI, WETH, chainSwap, accounts };
    }

    describe("Event Tests", async function () {
        it("Should emit TokenMapped event when owner changes pricefeed of a token", async function () {
            const { DAI, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );
            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );
            expect(await chainSwap.tokenToPricefeed(DAI.address))
                .to.emit("ChainlinkSwap", "TokenMapped")
                .withArgs(DAI.address, "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9");
        });

        it("Should emit SwapFeeChanged event when owner changes the default swap fee", async function () {
            const { chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.changeDefaultSwapfee(1020);
            expect(await chainSwap.getSwapFee())
                .to.emit("ChainlinkSwap", "SwapFeeChanged")
                .withArgs(1020, accounts[0].address);
        });

        it("Should emit TokenSwapFeeChanged event when owner changes token's swap fee", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await chainSwap.changeTokenSwapFee(DAI.address, 1010);
            expect(await chainSwap.getTokenFee(DAI.address))
                .to.emit("ChainlinkSwap", "TokenSwapFeeChanged")
                .withArgs(DAI.address, 1010, accounts[0].address);
        });

        it("Should emit LiquidityProvided event when owner provides liquidity", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
            expect(
                await chainSwap.provideLiquidity(
                    DAI.address,
                    ethers.utils.parseEther("10")
                )
            )
                .to.emit("ChainlinkSwap", "LiquidityProvided")
                .withArgs(
                    DAI.address,
                    ethers.utils.parseEther("10"),
                    accounts[0].address
                );
        });

        it("Should emit LiquidityWithdrawn event when owner withdraws liquidity", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
            await chainSwap.provideLiquidity(
                DAI.address,
                ethers.utils.parseEther("10")
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );

            expect(
                await chainSwap.withdrawLiquidity(
                    DAI.address,
                    ethers.utils.parseEther("10")
                )
            )
                .to.emit("ChainlinkSwap", "LiquidityWithdrawn")
                .withArgs(
                    DAI.address,
                    ethers.utils.parseEther("10"),
                    accounts[0].address
                );
        });

        it("Should emit LiquidityProvided event when owner provides batch liquidity", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

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

            expect(
                await chainSwap.provideLiquidityBatch(
                    [DAI.address, WETH.address],
                    [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
                )
            )
                .to.emit("ChainlinkSwap", "LiquidityProvided")
                .withArgs(
                    DAI.address,
                    ethers.utils.parseEther("10"),
                    accounts[0].address
                );
        });

        it("Should emit LiquidityWithdrawn event when owner withdraw batch liquidity", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

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
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );

            expect(
                await chainSwap.withdrawLiquidityBatch(
                    [DAI.address, WETH.address],
                    [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
                )
            )
                .to.emit("ChainlinkSwap", "LiquidityWithdrawn")
                .withArgs(
                    DAI.address,
                    ethers.utils.parseEther("10"),
                    accounts[0].address
                );
        });

        it("Should emit TokenSwapped event when any non-blacklisted address swap supported tokens", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await chainSwap.setPricefeed(
                WETH.address,
                "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("100000"));
            await WETH.approve(chainSwap.address, ethers.utils.parseEther("5"));

            await chainSwap.provideLiquidityBatch(
                [DAI.address, WETH.address],
                [ethers.utils.parseEther("100000"), ethers.utils.parseEther("5")]
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("100000")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );

            await WETH.transfer(accounts[1].address, ethers.utils.parseEther("1"));

            await WETH.connect(accounts[1]).approve(
                chainSwap.address,
                ethers.utils.parseEther("1")
            );

            expect(
                await chainSwap
                    .connect(accounts[1])
                    .swapSellForBuy(WETH.address, DAI.address, ethers.utils.parseEther("1"))
            )
                .to.emit("ChainlinkSwap", "TokenSwapped")
                .withArgs(DAI.address, WETH.address, ethers.utils.parseEther("1"));
        });
    });

    describe("Only owner can change pricefeed of a token", async function () {
        it("Should let owner change swap fee", async function () {
            const { DAI, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );
            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );
            expect(await chainSwap.tokenToPricefeed(DAI.address)).to.equal(
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );
        });
        it("Should revert if non owner attempts to change swap fee", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );
            await expect(
                chainSwap
                    .connect(accounts[1])
                    .setPricefeed(
                        DAI.address,
                        "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can change the default swap fee", async function () {
        it("Should set owner change the default swap fee", async function () {
            const { chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.changeDefaultSwapfee(1020);
            expect(await chainSwap.getSwapFee()).to.equal(1020);
        });
        it("Should revert if non owner attempts to change the default swap fee", async function () {
            const { chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );
            await expect(
                chainSwap.connect(accounts[1]).changeDefaultSwapfee(1020)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can change a token's swap fee", async function () {
        it("Should set owner change token's swap fee", async function () {
            const { DAI, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await chainSwap.changeTokenSwapFee(DAI.address, 1010);
            expect(await chainSwap.getTokenFee(DAI.address)).to.equal(1010);
        });
        it("Should revert if non owner attempts to change a token's swap fee", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await expect(
                chainSwap.connect(accounts[1]).changeTokenSwapFee(DAI.address, 1010)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can provide liquidity", async function () {
        it("Should set owner provide liquidity", async function () {
            const { DAI, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
            await chainSwap.provideLiquidity(
                DAI.address,
                ethers.utils.parseEther("10")
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );
        });
        it("Should revert if non owner attempts to provide liquidity", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.connect(accounts[1]).approve(
                chainSwap.address,
                ethers.utils.parseEther("10")
            );

            await expect(
                chainSwap
                    .connect(accounts[1])
                    .provideLiquidity(DAI.address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can withdraw liquidity", async function () {
        it("Should set owner withdraw liquidity", async function () {
            const { DAI, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
            await chainSwap.provideLiquidity(
                DAI.address,
                ethers.utils.parseEther("10")
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );

            await chainSwap.withdrawLiquidity(
                DAI.address,
                ethers.utils.parseEther("10")
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(0);
        });
        it("Should revert if non owner attempts to withdraw liquidity", async function () {
            const { DAI, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("10"));
            await chainSwap.provideLiquidity(
                DAI.address,
                ethers.utils.parseEther("10")
            );

            await expect(
                chainSwap
                    .connect(accounts[1])
                    .withdrawLiquidity(DAI.address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can provide batch liquidity", async function () {
        it("Should set owner provide batch liquidity", async function () {
            const { DAI, WETH, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

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
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );
        });
        it("Should revert if non owner attempts to provide batch liquidity", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );
            await chainSwap.setPricefeed(
                WETH.address,
                "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"
            );

            await DAI.connect(accounts[1]).approve(
                chainSwap.address,
                ethers.utils.parseEther("10")
            );

            await WETH.connect(accounts[1]).approve(
                chainSwap.address,
                ethers.utils.parseEther("5")
            );

            await expect(
                chainSwap
                    .connect(accounts[1])
                    .provideLiquidityBatch(
                        [DAI.address, WETH.address],
                        [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Only owner can withdraw batch liquidity", async function () {
        it("Should set owner withdraw batch liquidity", async function () {
            const { DAI, WETH, chainSwap } = await loadFixture(
                deployOneYearLockFixture
            );

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
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );

            await chainSwap.withdrawLiquidityBatch(
                [DAI.address, WETH.address],
                [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(0);
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(0);
        });
        it("Should revert if non owner attempts to withdraw batch liquidity", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

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
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("10")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );

            await expect(
                chainSwap
                    .connect(accounts[1])
                    .withdrawLiquidityBatch(
                        [DAI.address, WETH.address],
                        [ethers.utils.parseEther("10"), ethers.utils.parseEther("5")]
                    )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Any address can swap tokens", async function () {
        it("Should let swap supported tokens", async function () {
            const { DAI, WETH, chainSwap, accounts } = await loadFixture(
                deployOneYearLockFixture
            );

            await chainSwap.setPricefeed(
                DAI.address,
                "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
            );

            await chainSwap.setPricefeed(
                WETH.address,
                "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A"
            );

            await DAI.approve(chainSwap.address, ethers.utils.parseEther("100000"));
            await WETH.approve(chainSwap.address, ethers.utils.parseEther("5"));

            await chainSwap.provideLiquidityBatch(
                [DAI.address, WETH.address],
                [ethers.utils.parseEther("100000"), ethers.utils.parseEther("5")]
            );

            expect(await DAI.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("100000")
            );
            expect(await WETH.balanceOf(chainSwap.address)).to.equal(
                ethers.utils.parseEther("5")
            );

            await WETH.transfer(accounts[1].address, ethers.utils.parseEther("1"));

            await WETH.connect(accounts[1]).approve(
                chainSwap.address,
                ethers.utils.parseEther("1")
            );

            await expect(
                chainSwap
                    .connect(accounts[1])
                    .swapSellForBuy(
                        WETH.address,
                        DAI.address,
                        ethers.utils.parseEther("1")
                    )
            ).to.not.be.reverted;
        });
    });
});
