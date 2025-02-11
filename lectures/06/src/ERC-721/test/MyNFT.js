const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let MyNFT, myNFT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
  });

  it("Should have correct name and symbol", async function () {
    expect(await myNFT.name()).to.equal("MyNFT");
    expect(await myNFT.symbol()).to.equal("MNFT");
  });

  it("Owner should be able to mint an NFT", async function () {
    const tokenURI = "https://example.com/token/1";
    await myNFT.safeMint(owner.address, tokenURI);
    
    // The first token minted has tokenId 0
    expect(await myNFT.tokenURI(0)).to.equal(tokenURI);
    expect(await myNFT.ownerOf(0)).to.equal(owner.address);
  });

  it("Non-owner should not be able to mint an NFT", async function () {
    const tokenURI = "https://example.com/token/2";
    await expect(
      myNFT.connect(addr1).safeMint(addr1.address, tokenURI)
    ).to.be.reverted; // Checks that the call reverts (custom errors used)
  });

  it("Should allow transferring an NFT", async function () {
    const tokenURI = "https://example.com/token/1";
    await myNFT.safeMint(owner.address, tokenURI);
    
    // Owner transfers tokenId 0 to addr1
    await myNFT.transferFrom(owner.address, addr1.address, 0);
    expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
  });

  it("Should fail to query tokenURI for a non-existent token", async function () {
    await expect(myNFT.tokenURI(999)).to.be.reverted; // tokenId 999 does not exist
  });
});
