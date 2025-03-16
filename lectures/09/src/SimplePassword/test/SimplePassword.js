const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");
const poseidon = require("poseidon-lite")

let wasmFile = path.join(__dirname, "..", "ptau-data", "SimplePassword_js", "SimplePassword.wasm");
let zkeyFile = path.join(__dirname, "..", "ptau-data", "SimplePassword_0001.zkey");
const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ptau-data", "verification_key.json")));

function randomBigInt(){
	const hexString = Array(32)
    .fill()
    .map(() => Math.round(Math.random() * 0xF).toString(32))
    .join('');
	return BigInt(`0x${hexString}`);
}

describe("SimplePassword", function () {
    let owner, alice, bob;
    let proofOfSecret;

    beforeEach(async function () {
        [owner, alice, bob] = await ethers.getSigners();

		const Verifier = await ethers.getContractFactory("Groth16Verifier");
		verifier = await Verifier.deploy();
		await verifier.waitForDeployment();

        const SimplePassword = await ethers.getContractFactory("SimplePassword");
        proofOfSecret = await SimplePassword.deploy(await verifier.getAddress());
        await proofOfSecret.waitForDeployment();		
    });
	
    it("should deposit with a password hash and withdraw with proof of password", async function () {
		// creating password and its hash
		const password = randomBigInt();
		const passwordHash = poseidon.poseidon1([password]);
		
		await proofOfSecret.connect(alice).deposit(passwordHash, {value: ethers.parseEther("1.0")});
		const balance = await proofOfSecret.records(passwordHash);
		expect(balance).to.be.equal(ethers.parseEther("1.0"));
		
		const nonce = randomBigInt();
		const amount = ethers.parseEther("0.4");
		const address = BigInt(bob.address);
		
		const { proof, publicSignals } = await snarkjs.groth16.fullProve({password, address, amount, nonce}, wasmFile, zkeyFile);
		
		expect(publicSignals[0]).to.be.equal(passwordHash);
		const authHash = poseidon.poseidon4([password, address, amount, nonce]);
		expect(publicSignals[1]).to.be.equal(authHash);
		const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
		expect(res).to.be.true;
		
		const proofCalldata = await snarkjs.groth16.exportSolidityCallData( proof, publicSignals);
		const proofCalldataFormatted = JSON.parse("[" + proofCalldata + "]");
		const abiCoder = new ethers.AbiCoder()
		const proofCallDataEncoded = abiCoder.encode(["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256[5]"], proofCalldataFormatted);
		await proofOfSecret.connect(bob).withdraw(proofCallDataEncoded);
		const remaining = await proofOfSecret.records(passwordHash);
		expect(remaining).to.be.equal(ethers.parseEther("0.6"));
    });
});
