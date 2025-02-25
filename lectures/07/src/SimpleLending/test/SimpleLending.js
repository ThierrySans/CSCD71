// Hardhat Test Cases for FixedRateLending Contract

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FixedRateLending Contract", function () {
  let TokenA, tokenA, TokenB, tokenB, Oracle, oracle, Lending, lending;
  let owner, borrower, liquidator;

  beforeEach(async function () {
    [owner, borrower, liquidator] = await ethers.getSigners();

    TokenA = await ethers.getContractFactory("ERC20Mock");
    tokenA = await TokenA.deploy("TokenA", "TKA", owner.address, 10000);
	await tokenA.waitForDeployment();

    TokenB = await ethers.getContractFactory("ERC20Mock");
    tokenB = await TokenB.deploy("TokenB", "TKB", owner.address, 10000);
	await tokenB.waitForDeployment();

    Oracle = await ethers.getContractFactory("MockOracle");
    oracle = await Oracle.deploy(1);
	await oracle.waitForDeployment();

    Lending = await ethers.getContractFactory("SimpleLending");
    lending = await Lending.deploy(await tokenA.getAddress(), await tokenB.getAddress(), await oracle.getAddress());
	await lending.waitForDeployment();
  });

  describe("Lender Operations", function () {
    it("Should allow owner to deposit and withdraw TokenA", async function () {
      await tokenA.connect(owner).approve(await lending.getAddress(), 1000);
      await lending.connect(owner).deposit(1000);
      expect(await tokenA.balanceOf(owner)).to.equal(9000);

      await lending.connect(owner).withdraw(500);
      expect(await tokenA.balanceOf(owner)).to.equal(9500);
    });

    it("Should allow owner to claim interest", async function () {
      await tokenA.connect(owner).approve(await lending.getAddress(), 1000);
      await lending.connect(owner).deposit(1000);

      await tokenA.connect(borrower).approve(await lending.getAddress(), 1500);
      await tokenB.connect(owner).transfer(borrower.address, 1000);
      await tokenB.connect(borrower).approve(await lending.getAddress(), 1000);

      await lending.connect(borrower).borrow(
        1500,
        1000,
      );

      await lending.connect(borrower).repayLoan(0);
      await lending.connect(owner).claimInterest();

      expect(await tokenA.balanceOf(owner.address)).to.be.above(1000);
    });
  });

  describe("Borrower Operations", function () {
    it("Should allow borrower to create and repay loan", async function () {
      await tokenA.connect(borrower).approve(await lending.getAddress(), 1500);
      await tokenB.connect(owner).transfer(borrower.address, 1000);
      await tokenB.connect(borrower).approve(await lending.getAddress(), 1000);

      await lending.connect(borrower).createLoan(
        1500,
        1000,
        (await ethers.provider.getBlock("latest")).timestamp + 86400
      );

      await lending.connect(borrower).repayLoan(0);
      expect((await lending.loans(0)).repaid).to.equal(true);
    });
  });

  describe("Liquidation Process", function () {
    it("Should liquidate loan after maturity", async function () {
      await tokenA.connect(borrower).approve(await lending.getAddress(), 1500);
      await tokenB.connect(owner).transfer(borrower.address, 1000);
      await tokenB.connect(borrower).approve(await lending.getAddress(), 1000);

      await lending.connect(borrower).createLoan(
        1500,
        1000,
        (await ethers.provider.getBlock("latest")).timestamp + 1
      );

      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");

      await tokenB.connect(liquidator).approve(await lending.getAddress(), 1000);
      await lending.connect(liquidator).liquidateLoan(0);
      expect((await lending.loans(0)).liquidated).to.equal(true);
    });

    it("Should liquidate loan if collateral value drops", async function () {
      await tokenA.connect(borrower).approve(await lending.getAddress(), 1500);
      await tokenB.connect(owner).transfer(borrower.address, 1000);
      await tokenB.connect(borrower).approve(await lending.getAddress(), 1000);

      await lending.connect(borrower).createLoan(
        1500,
        1000,
        (await ethers.provider.getBlock("latest")).timestamp + 86400
      );

      await oracle.setExchangeRate(8);
      await tokenB.connect(liquidator).approve(await lending.getAddress(), 1000);
      await lending.connect(liquidator).liquidateLoan(0);

      expect((await lending.loans(0)).liquidated).to.equal(true);
    });
  });
});
