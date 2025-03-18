// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// import "hardhat/console.sol";

contract OptimisticRollup {

	using ECDSA for bytes32;
	using MessageHashUtils for bytes32;

    struct Transaction {
        address from;
		address to;
		uint256 amount;
		bytes signature;
    }
	
	bytes32 private root;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
	
    constructor() {}

    function deposit() payable external {
        emit Deposit(msg.sender, msg.value);
    }

	function verifyProof(address addr, uint256 balance, bytes32[] memory proof) public view returns(bool) {
		bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(addr, balance))));
		return MerkleProof.verify(proof, root, leaf);
	}

    function withdraw(uint256 balance, uint256 amount, bytes32[] memory proof) external {
		require(balance >= amount, "Insufficient funds");
		require(verifyProof(msg.sender, balance, proof) , "Invalid proof");
        emit Withdrawal(msg.sender, amount);
    }

    function update(Transaction[] calldata transactions, bytes32 _root) external {
        for (uint256 i = 0; i < transactions.length; i++) {
            Transaction calldata txn = transactions[i];

            bytes32 txnHash = keccak256(abi.encodePacked(txn.from, txn.to, txn.amount)).toEthSignedMessageHash();
			address signer = (txn.from == address(0) || txn.to == address(0))? msg.sender : txn.from;
			require(txnHash.recover(txn.signature) == signer, "Invalid signature for transaction");
			
        }
		// here we trust the aggregator for producing the right root
		// in a real optimistic rollup, the coordinator must deposit a stake
		// there is usually 7 days to verify and dispute whether the root is correct
		// if incorrectm stake is slashed
		root = _root;
    }
}

