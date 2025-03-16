const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const poseidon = require("poseidon-lite");
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
    let owner;
    let verifier;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
		const Verifier = await ethers.getContractFactory("Groth16Verifier");
		verifier = await Verifier.deploy();
		await verifier.waitForDeployment();
    });

    it("should generate a proof", async function () {
		// creating 100 of secrets
		const random = Math.floor(Math.random() * 100);
		const tree = new IncrementalMerkleTree(poseidon.poseidon2, 20, BigInt(0), 2);
		let secret;
		for (let i =0; i<100; i++){
			const s = randomBigInt();
			if (random == i) secret = s;
			await tree.insert(poseidon.poseidon1([s]));
		};
		const secretHash = poseidon.poseidon1([secret]);
	    const merkleProof = tree.createProof(tree.indexOf(secretHash));
	    const treeSiblings = merkleProof.siblings.map((s) => s[0]);
	    const treePathIndices = merkleProof.pathIndices;
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({treeSiblings, treePathIndices, secret}, wasmFile, zkeyFile);
		const root = tree.root;
		expect(publicSignals[0]).to.be.equal(root);
		const offchain = await snarkjs.groth16.verify(vKey, publicSignals, proof);
		expect(offchain).to.be.true;
		const proofCalldata = await snarkjs.groth16.exportSolidityCallData( proof, publicSignals);
		const [pi_a, pi_b, pi_c, signals] = JSON.parse("[" + proofCalldata + "]");
		const onchain = await verifier.verifyProof(pi_a, pi_b, pi_c, signals);
		expect(onchain).to.be.true;
    });
});
