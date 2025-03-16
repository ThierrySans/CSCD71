const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const poseidon = require("poseidon-lite");
const { PoseidonT3 } = require('poseidon-solidity')
const { IncrementalMerkleTree } = require("@zk-kit/incremental-merkle-tree");

let wasmFile = path.join(__dirname, "..", "ptau-data", "ProofOfMembership_js", "ProofOfMembership.wasm");
let zkeyFile = path.join(__dirname, "..", "ptau-data", "ProofOfMembership_0001.zkey");
const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ptau-data", "verification_key.json")));

function randomBigInt(){
	const hexString = Array(32)
    .fill()
    .map(() => Math.round(Math.random() * 0xF).toString(32))
    .join('');
	return BigInt(`0x${hexString}`);
}

describe("Proof Of Membership", function () {
    let owner, alice, bob, charlie, denise;
    let proofOfMembership, tree;

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
		
        const ProofOfMembership = await ethers.getContractFactory("ProofOfMembership", {
			libraries: { IncrementalBinaryTree: await incrementalBinaryTree.getAddress() }
        });
		
        proofOfMembership = await ProofOfMembership.deploy(await verifier.getAddress());
        await proofOfMembership.waitForDeployment();
    });

    it("should generate a proof and verify locally", async function () {
		// creating 100 of secrets
		const secrets = [];
		const secretHashes = [];
		for (let i =0; i<100; i++){
			const secret = randomBigInt();
			secrets.push(secret);
			secretHashes.push(poseidon.poseidon1([secret]));
		};
		
		const address = BigInt(bob.address);
		const amount = ethers.parseEther("1.0");
		const nonce = randomBigInt();
		const random = Math.floor(Math.random() * secrets.length);
		const secret = secrets[random];
		const secretHash = secretHashes[random];
		const tree = new IncrementalMerkleTree(poseidon.poseidon2, 20, BigInt(0), 2, secretHashes);
	    const merkleProof = tree.createProof(tree.indexOf(secretHash));
	    const treeSiblings = merkleProof.siblings.map((s) => s[0]);
	    const treePathIndices = merkleProof.pathIndices;
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({treeSiblings, treePathIndices, secret, address, amount, nonce}, wasmFile, zkeyFile);

		const root = tree.root;
		expect(publicSignals[0]).to.be.equal(root);
		const authHash = poseidon.poseidon4([secret, address, amount, nonce]);
		expect(publicSignals[1]).to.be.equal(authHash);
		const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
		expect(res).to.be.true;
    });
	
    it("should deposit with a hash and withdraw with proof", async function () {
		// creating 100 of secrets
		const secrets = [];
		const secretHashes = [];
		for (let i =0; i<100; i++){
			const secret = randomBigInt();
			secrets.push(secret);
			const secretHash = poseidon.poseidon1([secret]);
			secretHashes.push(secretHash);
			await proofOfMembership.connect(alice).deposit(secretHash, {value: ethers.parseEther("1.0")});
		};

		const balance = await ethers.provider.getBalance(await proofOfMembership.getAddress());
		expect(balance).to.be.equal(ethers.parseEther("100.0"));

		const address = BigInt(bob.address);
		const amount = ethers.parseEther("1.0");
		const nonce = randomBigInt();
		const random = Math.floor(Math.random() * secrets.length);
		const secret = secrets[random];
		const secretHash = secretHashes[random];
		const tree = new IncrementalMerkleTree(poseidon.poseidon2, 20, BigInt(0), 2, secretHashes);
	    const merkleProof = tree.createProof(tree.indexOf(secretHash));
	    const treeSiblings = merkleProof.siblings.map((s) => s[0]);
	    const treePathIndices = merkleProof.pathIndices;
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({treeSiblings, treePathIndices, secret, address, amount, nonce}, wasmFile, zkeyFile);

		const proofCalldata = await snarkjs.groth16.exportSolidityCallData( proof, publicSignals);
		const proofCalldataFormatted = JSON.parse("[" + proofCalldata + "]");
		const abiCoder = new ethers.AbiCoder();
		const proofCallDataEncoded = abiCoder.encode(["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256[5]"], proofCalldataFormatted);
		await proofOfMembership.connect(bob).withdraw(proofCallDataEncoded);
    });
});
