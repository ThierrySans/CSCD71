// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Groth16Verifier.sol";

import "poseidon-solidity/PoseidonT3.sol";
import "@zk-kit/incremental-merkle-tree.sol/IncrementalBinaryTree.sol";

// import "hardhat/console.sol";

contract ProofOfMembership{
    using IncrementalBinaryTree for IncrementalTreeData;
	IncrementalTreeData public tree;
	
	uint256 private immutable depth = 20;

	Groth16Verifier private immutable verifier;
	
	mapping(uint256 => bool) nonces;
	
	event SecretAdded(uint256 secretHash, uint256 root);
	
    constructor(Groth16Verifier _verifier) {
		verifier = _verifier;
		tree.init(depth, 0);
    }

    function deposit(uint256 secretHash) payable external {
		tree.insert(secretHash);
		emit SecretAdded(secretHash, tree.root);
    }

    function withdraw(bytes calldata proof) external { 
		// unwrap the proof (to extract signals)
		( uint256[2] memory pi_a, uint256[2][2] memory pi_b, uint256[2] memory pi_c, uint256[5] memory signals)
			= abi.decode(proof, (uint256[2], uint256[2][2], uint256[2], uint256[5]));
		// check the proof
		(bool valid, ) = address(verifier).staticcall(abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pi_a, pi_b, pi_c, signals));
		require(valid, "Proof verification failed");
		// extract parameters
		uint256 root = signals[0];
		address addr = address(uint160(signals[2]));
		uint256 amount = signals[3];
		uint256 nonce = signals[4];
		// check the root
		require(root == tree.root, "wrong tree root");
		// check and update nonce reuse
		require(!nonces[nonce], "nonce has already been used");
		nonces[nonce] = true;
		// Check and update amount
		require(amount>0, "Amount should be greater than 0");
		// Transfer funds
		(bool sent, ) = addr.call{value: amount}("");
		require(sent, "Failed to send Ether");
    }
}
