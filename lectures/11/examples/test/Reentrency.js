const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrency", function () {
    
  it("Should test the bank", async function () {
      const Bank = await ethers.getContractFactory("Bank");
      const bank = await Bank.deploy();
      await bank.deployed();

      const [alice, bob] = await ethers.getSigners();
      await bank.connect(alice).deposit({value: ethers.utils.parseEther("10")});
    
      expect(await bank.connect(alice).balance()).to.equal(ethers.utils.parseEther("10"));
      await bank.connect(alice).deposit({value: ethers.utils.parseEther("5")});
      expect(await bank.connect(alice).balance()).to.equal(ethers.utils.parseEther("15"));
    
      await bank.connect(bob).deposit({value: ethers.utils.parseEther("20")});
      expect(await bank.connect(bob).balance()).to.equal(ethers.utils.parseEther("20"));
    
      const bankBalance = await bank.connect(alice).balance();
      await bank.connect(alice).withdraw();
      expect(await bank.connect(alice).balance()).to.equal(ethers.utils.parseEther("0"));
      expect(await bank.connect(bob).balance()).to.equal(ethers.utils.parseEther("20"));
  });
  
   it("Should run the attack", async function () {

       const Bank = await ethers.getContractFactory("Bank");
       const bank = await Bank.deploy();
       await bank.deployed();

       const [alice, bob, charlie, mallory] = await ethers.getSigners();
       await bank.connect(alice).deposit({value: ethers.utils.parseEther("10")});
       await bank.connect(bob).deposit({value: ethers.utils.parseEther("25")});
       await bank.connect(charlie).deposit({value: ethers.utils.parseEther("6")});

       const BankAttack = await ethers.getContractFactory("BankAttack");
       const bankAttack = await BankAttack.deploy(bank.address);
       await bankAttack.deployed();

       await bankAttack.connect(mallory).deposit({value: ethers.utils.parseEther("1")});
       expect(await ethers.provider.getBalance(bankAttack.address)).to.equal(0);
       expect(await bankAttack.balance()).to.equal(ethers.utils.parseEther("1"));
       
       await bankAttack.connect(mallory).withdraw();
       expect(await ethers.provider.getBalance(bankAttack.address)).to.equal(ethers.utils.parseEther("42"));
       expect(await ethers.provider.getBalance(bank.address)).to.equal(0);
   })
});
