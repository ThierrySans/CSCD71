const { expect } = require("chai");
const { ethers } = require("hardhat");

const { PoseidonT2 } = require('poseidon-solidity')

const ZERO = ethers.ZeroAddress;

async function addTransaction(balances, transactions, signer, from, to, amount){
	const message = ethers.solidityPackedKeccak256(
		["address", "address", "uint256"],
		[from, to, amount]
	);
	const signature = await signer.signMessage(ethers.toBeArray(message));
	if ((!(from in balances)) || (balances[from]<amount)) throw new Error("Insufficient balance");
	balances[from] -= amount;
	if (!(to in balances)) balances[to] = amount;
	else balances[to] += amount;
	transactions.push({from, to, amount, signature});
}

describe("ZK Rollup", function () {
    let owner, alice, bob, charlie;
    let zkRollup;

    beforeEach(async function () {
        [owner, alice, bob, charlie] = await ethers.getSigners();

		const PoseidonT2 = await ethers.getContractFactory("PoseidonT2");
		const poseidonT2 = await PoseidonT2.deploy();
		await poseidonT2.waitForDeployment();

		const UpdateVerifier = await ethers.getContractFactory("UpdateVerifier");
		updateVerifier = await UpdateVerifier.deploy();
		await updateVerifier.waitForDeployment();
		
		const RollupVerifier = await ethers.getContractFactory("RollupVerifier");
		rollupVerifier = await RollupVerifier.deploy();
		await rollupVerifier.waitForDeployment();

		const ZkRollup = await ethers.getContractFactory("ZkRollup", {
			libraries: { PoseidonT2: await poseidonT2.getAddress()  }
		});
		zkRollup = await ZkRollup.deploy(await updateVerifier.getAddress(), await rollupVerifier.getAddress());
		await zkRollup.waitForDeployment();
    });
	
	it("should deposit", async function () {
		
	});
	
	it("should withdraw", async function () {
		
	});
	
    it("should rollup", async function () {
		// const balances = {};
		// let transactions = [];
		// 
		// // deposit
		// await zkRollup.connect(alice).deposit({value: ethers.parseEther("1.0")});
		// await addTransaction(balances, transactions, owner, ZERO, alice.address, ethers.parseEther("1.0"));
		//
		// // other transactions
		// await addTransaction(balances, transactions, alice, alice.address, bob.address, ethers.parseEther("0.6"));
		// await addTransaction(balances, transactions, alice, alice.address, charlie.address, ethers.parseEther("0.1"));
		// await addTransaction(balances, transactions, bob, bob.address, charlie.address, ethers.parseEther("0.4"));
		//
		// // rollup
		// let tree = StandardMerkleTree.of(Object.entries(balances), ["address", "uint256"]);
		// await zkRollup.update(transactions, tree.root);
		//
		// // check alice balance
		// const aliceValue = [alice.address, balances[alice.address]];
		// const aliceProof = tree.getProof(aliceValue);
		// // check alice balance offchain
		// expect(tree.verify(aliceValue, aliceProof)).to.be.true;
		// // check alice balance onchain
		// expect(await zkRollup.verifyProof(alice.address, balances[alice.address], aliceProof)).to.be.true;
		//
		// // allow alice to withdraw 0.2 ETH
		// const aliceAmount = ethers.parseEther("0.2");
		// await zkRollup.connect(alice).withdraw(balances[alice.address], aliceAmount, aliceProof);
		// await addTransaction(balances, transactions, owner, alice.address, ZERO, aliceAmount);
		// await expect(balances[alice.address]).to.be.equal(ethers.parseEther("0.1"));
		//
		// // allow bob to withdraw 0.2 ETH
		// const bobProof = tree.getProof([bob.address, balances[bob.address]]);
		// const bobAmount = ethers.parseEther("0.2");
		// await zkRollup.connect(bob).withdraw(balances[bob.address], bobAmount, bobProof);
		// await addTransaction(balances, transactions, owner, bob.address, ZERO, bobAmount);
		// await expect(balances[bob.address]).to.be.equal(ethers.parseEther("0"));
		//
		// // do not allow charlie to withdraw 0.6 ETH (out of 0.5 ETH)
		// const charlieProof = tree.getProof([charlie.address, balances[charlie.address]]);
		// const tx = zkRollup.connect(charlie).withdraw(balances[charlie.address], ethers.parseEther("0.6"), charlieProof);
		// await expect(tx).to.be.revertedWith('Insufficient funds');
		// await expect(balances[charlie.address]).to.be.equal(ethers.parseEther("0.5"));
		//
		// // rollup again
		// const nextTree = StandardMerkleTree.of(Object.entries(balances), ["address", "uint256"]);
		// await zkRollup.update(transactions, nextTree.root);
		//
		// // check balances
		// const aliceNewProof = nextTree.getProof([alice.address, balances[alice.address]]);
		// expect(await zkRollup.verifyProof(alice.address, balances[alice.address], aliceNewProof)).to.be.true;
		// const bobNewProof = nextTree.getProof([bob.address, balances[bob.address]]);
		// expect(await zkRollup.verifyProof(bob.address, balances[bob.address], bobNewProof)).to.be.true;
		// const charlieNewProof = nextTree.getProof([charlie.address, balances[charlie.address]]);
		// expect(await zkRollup.verifyProof(charlie.address, balances[charlie.address], charlieNewProof)).to.be.true;

    });
});
