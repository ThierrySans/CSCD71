const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const poseidon = require("poseidon-lite");

let wasmFile = path.join(__dirname, "..", "zksetup", "ProofOfSecret_js", "ProofOfSecret.wasm");
let zkeyFile = path.join(__dirname, "..", "zksetup", "ProofOfSecret.zkey");
const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "zksetup", "verification_key.json")));

function randomBigInt(){
	const hexString = Array(32)
    .fill()
    .map(() => Math.round(Math.random() * 0xF).toString(32))
    .join('');
	return BigInt(`0x${hexString}`);
}

describe("Proof Of Secret", function () {
    let owner;
    let verifier;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
		const Verifier = await ethers.getContractFactory("ProofOfSecretVerifier");
		verifier = await Verifier.deploy();
		await verifier.waitForDeployment();
    });

    it("should generate and verify a proof of secret", async function () {
		const secret = randomBigInt();
		const secretHash = poseidon.poseidon1([secret]);
		
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({secret}, wasmFile, zkeyFile);
		expect(publicSignals[0]).to.be.equal(secretHash);
		const offchain = await snarkjs.groth16.verify(vKey, publicSignals, proof);
		expect(offchain).to.be.true;
		const proofCalldata = await snarkjs.groth16.exportSolidityCallData( proof, publicSignals);
		const [pi_a, pi_b, pi_c, signals] = JSON.parse("[" + proofCalldata + "]");
		const onchain = await verifier.verifyProof(pi_a, pi_b, pi_c, signals);
		expect(onchain).to.be.true;
    });
});
