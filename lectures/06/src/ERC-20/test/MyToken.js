const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
    let MyToken, myToken, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy();
        await myToken.waitForDeployment();
    });

    it("Should have correct name and symbol", async function () {
        expect(await myToken.name()).to.equal("MyToken");
        expect(await myToken.symbol()).to.equal("MTK");
    });

    it("Should assign initial supply to owner", async function () {
        const ownerBalance = await myToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal(ethers.parseUnits("1000", 18));
    });

    it("Should allow transfers between accounts", async function () {
        await myToken.transfer(addr1.address, ethers.parseUnits("100", 18));
        const addr1Balance = await myToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
        await expect(
            myToken.connect(addr1).transfer(addr2.address, ethers.parseUnits("50", 18))
        ).to.be.reverted; 
    });

    it("Should allow an approved spender to transfer on behalf", async function () {
        await myToken.approve(addr1.address, ethers.parseUnits("100", 18));
        expect(await myToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseUnits("100", 18));

        await myToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseUnits("50", 18));
        expect(await myToken.balanceOf(addr2.address)).to.equal(ethers.parseUnits("50", 18));
    });

    it("Should fail transferFrom if not enough allowance", async function () {
        await expect(
            myToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseUnits("50", 18))
        ).to.be.reverted; 
    });

    it("Should allow the owner to mint tokens", async function () {
        await myToken.mint(addr1.address, ethers.parseUnits("500", 18));
        expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits("500", 18));
    });

    it("Should prevent non-owner from minting", async function () {
        await expect(
            myToken.connect(addr1).mint(addr1.address, ethers.parseUnits("500", 18))
        ).to.be.reverted; 
    });

    it("Should allow token burning", async function () {
        await myToken.burn(ethers.parseUnits("200", 18));
        expect(await myToken.balanceOf(owner.address)).to.equal(ethers.parseUnits("800", 18));
    });

    it("Should fail burning more than balance", async function () {
        await expect(
            myToken.connect(addr1).burn(ethers.parseUnits("50", 18))
        ).to.be.reverted; 
    });
});
