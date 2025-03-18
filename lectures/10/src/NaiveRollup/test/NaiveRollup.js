const { expect } = require("chai");
const { ethers } = require("hardhat");

async function signTransaction(signer, to, amount){
	const from = signer.address;
	const message = ethers.solidityPackedKeccak256(
		["address", "address", "uint256"],
		[from, to, amount]
	);
	const signature = await signer.signMessage(ethers.toBeArray(message));
	return {from, to, amount, signature};
}

describe("Naive Rollup", function () {
    let owner, alice, bob, charlie;
    let naiveRollup;

    beforeEach(async function () {
        [owner, alice, bob, charlie] = await ethers.getSigners();

		const NaiveRollup = await ethers.getContractFactory("NaiveRollup");
		naiveRollup = await NaiveRollup.deploy();
		await naiveRollup.waitForDeployment();
    });
	
    it("should deposit and withdraw funds", async function () {
		await naiveRollup.connect(alice).deposit({value: ethers.parseEther("1.0")});
		let balance = await naiveRollup.balances(alice.address);
		expect(balance).to.be.equal(ethers.parseEther("1.0"));
		
		await naiveRollup.connect(alice).withdraw(ethers.parseEther("0.6"));
		balance = await naiveRollup.balances(alice.address);
		expect(balance).to.be.equal(ethers.parseEther("0.4"));
    });
	
    it("should rollup", async function () {
		await naiveRollup.connect(alice).deposit({value: ethers.parseEther("1.0")});
		let balance = await naiveRollup.balances(alice.address);
		expect(balance).to.be.equal(ethers.parseEther("1.0"));
		
		// create transaction off chain
		const transactions = [];
		transactions.push(await signTransaction(alice, bob.address, ethers.parseEther("0.6")));
		transactions.push(await signTransaction(alice, charlie.address, ethers.parseEther("0.1")));
		transactions.push(await signTransaction(bob, charlie.address, ethers.parseEther("0.4")));
		
		await naiveRollup.update(transactions);
		
		let aliceBalance = await naiveRollup.balances(alice.address);
		expect(aliceBalance).to.be.equal(ethers.parseEther("0.3"));
		let bobBalance = await naiveRollup.balances(bob.address);
		expect(bobBalance).to.be.equal(ethers.parseEther("0.2"));
		let charlieBalance = await naiveRollup.balances(charlie.address);
		expect(charlieBalance).to.be.equal(ethers.parseEther("0.5"));

    });
});
