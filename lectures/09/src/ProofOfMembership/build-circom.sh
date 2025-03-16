#!/bin/bash

rm contracts/Groth16Verifier.sol
rm -Rf ptau-data
mkdir ptau-data

# compile circom
circom circuits/ProofOfMembership.circom --r1cs --wasm -o ptau-data/

# Phase 2 (contract specific)
snarkjs groth16 setup ptau-data/ProofOfMembership.r1cs ../ptau-ceremony/pot14_final.ptau ptau-data/ProofOfMembership_0000.zkey
snarkjs zkey contribute ptau-data/ProofOfMembership_0000.zkey ptau-data/ProofOfMembership_0001.zkey --name="Proof Of Secret" -v
snarkjs zkey export verificationkey ptau-data/ProofOfMembership_0001.zkey ptau-data/verification_key.json

# Generate solidty contract
snarkjs zkey export solidityverifier ptau-data/ProofOfMembership_0001.zkey contracts/Groth16Verifier.sol