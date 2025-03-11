// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Groth16Verifier.sol";

// import "hardhat/console.sol";

contract ProofOfSecret {
	
	Groth16Verifier private immutable verifier;
	
    struct Record {
        uint256 amount;
		bool active;
    }
	
    mapping(uint256 => Record) public records;
	
    constructor(Groth16Verifier _verifier) {
		verifier = _verifier;
    }

    function deposit(uint256 hash) payable external {
		Record storage record = records[hash];
		if (record.active){
			record.amount += msg.value;
		}else{
			records[hash] = Record({ amount: msg.value, active: true });
		}
    }

    function withdraw(bytes calldata proof) external {
		// unwrap the proof
		( uint256[2] memory pi_a, uint256[2][2] memory pi_b, uint256[2] memory pi_c, uint256[1] memory signals ) = abi.decode(proof, (uint256[2], uint256[2][2], uint256[2], uint256[1]));
		// check the proof
        (bool valid, ) = address(verifier).staticcall(abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pi_a, pi_b, pi_c, signals));
        require(valid, "Proof verification failed");
		// Retrieve deposits
		Record storage record = records[signals[0]];
		require(record.active, "No longer active");
		record.active = false;
		// Transfer funds
		(bool sent, ) = address(msg.sender).call{value: record.amount}("");
		require(sent, "Failed to send Ether");
    }
}
