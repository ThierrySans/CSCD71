// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Groth16Verifier.sol";

// import "hardhat/console.sol";

contract SimplePassword {
	
	Groth16Verifier private immutable verifier;
	
    struct Record {
        uint256 amount;
		mapping(uint256 => bool) nonces;
    }
	
    mapping(uint256 => Record) public records;
	
    constructor(Groth16Verifier _verifier) {
		verifier = _verifier;
    }

    function deposit(uint256 passwordHash) payable external {
		records[passwordHash].amount += msg.value;
    }

    function withdraw(bytes calldata proof) external { 
		// unwrap the proof (to extract signals)
		( uint256[2] memory pi_a, uint256[2][2] memory pi_b, uint256[2] memory pi_c, uint256[5] memory signals)
			= abi.decode(proof, (uint256[2], uint256[2][2], uint256[2], uint256[5]));
		// check the proof
		(bool valid, ) = address(verifier).staticcall(abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pi_a, pi_b, pi_c, signals));
		require(valid, "Proof verification failed");
		// extract parameters
		uint256 passwordHash = signals[0];
		address addr = address(uint160(signals[2]));
		uint256 amount = signals[3];
		uint256 nonce = signals[4];
		// check and update nonce reuse
		require(!records[passwordHash].nonces[nonce], "nonce has already been used");
		records[passwordHash].nonces[nonce] = true;
		// Check and update amount
		require(amount>0, "Amount should be greater than 0");
		require(records[passwordHash].amount >= amount, "insufficient balance");
		records[passwordHash].amount -= amount;
		// Transfer funds
		(bool sent, ) = addr.call{value: amount}("");
		require(sent, "Failed to send Ether");
    }
}
