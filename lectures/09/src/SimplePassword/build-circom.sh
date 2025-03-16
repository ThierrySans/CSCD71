#!/bin/bash

rm contracts/Groth16Verifier.sol
rm -Rf ptau-data
mkdir ptau-data

# compile circom
circom circuits/SimplePassword.circom --r1cs --wasm -o ptau-data/

# Phase 2 (contract specific)
snarkjs groth16 setup ptau-data/SimplePassword.r1cs ../ptau-ceremony/pot14_final.ptau ptau-data/SimplePassword_0000.zkey
snarkjs zkey contribute ptau-data/SimplePassword_0000.zkey ptau-data/SimplePassword_0001.zkey --name="Proof Of Secret" -v
snarkjs zkey export verificationkey ptau-data/SimplePassword_0001.zkey ptau-data/verification_key.json

# Generate solidty contract
snarkjs zkey export solidityverifier ptau-data/SimplePassword_0001.zkey contracts/Groth16Verifier.sol