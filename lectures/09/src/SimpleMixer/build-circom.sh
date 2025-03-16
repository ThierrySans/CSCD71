#!/bin/bash

rm contracts/Groth16Verifier.sol
rm -Rf ptau-data
mkdir ptau-data

# compile circom
circom circuits/SimpleMixer.circom --r1cs --wasm -o ptau-data/

# Phase 2 (contract specific)
snarkjs groth16 setup ptau-data/SimpleMixer.r1cs ../ptau-ceremony/pot14_final.ptau ptau-data/SimpleMixer_0000.zkey
snarkjs zkey contribute ptau-data/SimpleMixer_0000.zkey ptau-data/SimpleMixer_0001.zkey --name="Proof Of Secret" -v
snarkjs zkey export verificationkey ptau-data/SimpleMixer_0001.zkey ptau-data/verification_key.json

# Generate solidty contract
snarkjs zkey export solidityverifier ptau-data/SimpleMixer_0001.zkey contracts/Groth16Verifier.sol