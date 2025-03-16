const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const poseidon = require("poseidon-lite");
const { PoseidonT3 } = require('poseidon-solidity')
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");

let wasmFile = path.join(__dirname, "..", "ptau-data", "SimpleMixer_js", "SimpleMixer.wasm");
let zkeyFile = path.join(__dirname, "..", "ptau-data", "SimpleMixer_0001.zkey");
const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ptau-data", "verification_key.json")));

function randomBigInt(){
	const hexString = Array(32)
    .fill()
    .map(() => Math.round(Math.random() * 0xF).toString(32))
    .join('');
	return BigInt(`0x${hexString}`);
}

describe("SimpleMixer", function () {
    let owner, alice, bob, charlie, denise;
    let simpleMixer;

    beforeEach(async function () {
        [owner, alice, bob] = await ethers.getSigners();

		const Verifier = await ethers.getContractFactory("Groth16Verifier");
		verifier = await Verifier.deploy();
		await verifier.waitForDeployment();
		
		const PoseidonT3 = await ethers.getContractFactory("PoseidonT3");
		const poseidonT3 = await PoseidonT3.deploy();
		await poseidonT3.waitForDeployment();

		const IncrementalBinaryTree = await ethers.getContractFactory("IncrementalBinaryTree", {
			libraries: { PoseidonT3: await poseidonT3.getAddress()  }
		});
        const incrementalBinaryTree = await IncrementalBinaryTree.deploy();
		await incrementalBinaryTree.waitForDeployment();
		
        const SimpleMixer = await ethers.getContractFactory("SimpleMixer", {
			libraries: { IncrementalBinaryTree: await incrementalBinaryTree.getAddress() }
        });
		
        simpleMixer = await SimpleMixer.deploy(await verifier.getAddress());
        await simpleMixer.waitForDeployment();
    });
	
    it("should deposit with a commitment hash and withdraw with proof", async function () {
		// creating 100 commitment hashes
		const tree = new IncrementalMerkleTree(poseidon.poseidon2, 20, BigInt(0), 2);
		const random = Math.floor(Math.random() * 100);
		let secret, nullifier;
		const secretsAndNullifiers = [];
		for (let i =0; i<100; i++){
			const s = randomBigInt();
			const n = randomBigInt();
			if (i == random){
				secret = s;
				nullifier = n;
			}
			const commitmentHash = poseidon.poseidon2([s, n]);
			tree.insert(commitmentHash);
			await simpleMixer.connect(alice).deposit(commitmentHash, {value: ethers.parseEther("1.0")});
		};

		// checking balance
		const balance = await ethers.provider.getBalance(await simpleMixer.getAddress());
		expect(balance).to.be.equal(ethers.parseEther("100.0"));
		
		// Building proof
		const address = BigInt(bob.address);
		const commitmentHash = poseidon.poseidon2([secret, nullifier]);
		const merkleProof = tree.createProof(tree.indexOf(commitmentHash));
		const treeSiblings = merkleProof.siblings.map((s) => s[0]);
		const treePathIndices = merkleProof.pathIndices;
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({treeSiblings, treePathIndices, secret, nullifier, address}, wasmFile, zkeyFile);
		
		// verifying outputs and proof
		expect(publicSignals[0]).to.be.equal(tree.root);
		const authHash = poseidon.poseidon3([secret, nullifier, address]);
		expect(publicSignals[1]).to.be.equal(authHash);
		const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
		expect(res).to.be.true;
		
		// packing the proof
		const proofCalldata = await snarkjs.groth16.exportSolidityCallData( proof, publicSignals);
		const proofCalldataFormatted = JSON.parse("[" + proofCalldata + "]");
		const abiCoder = new ethers.AbiCoder();
		const proofCallDataEncoded = abiCoder.encode(["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256[4]"], proofCalldataFormatted);
		// withdrawing with the proof
		await simpleMixer.connect(bob).withdraw(proofCallDataEncoded);
    });
});
