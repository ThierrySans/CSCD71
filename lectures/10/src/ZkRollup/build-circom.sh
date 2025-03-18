#!/bin/bash

rm contracts/Groth16Verifier.sol
rm -Rf ptau-data
mkdir ptau-data

# Powers of Tau
snarkjs powersoftau new bn128 14 ptau-data/pot14_0000.ptau -v
snarkjs powersoftau contribute ptau-data/pot14_0000.ptau ptau-data/pot14_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 ptau-data/pot14_0001.ptau ptau-data/pot14_final.ptau -v

# compile circom
circom circuits/ZkRollup.circom --r1cs --wasm -o ptau-data/

# Phase 2 (contract specific)
snarkjs groth16 setup ptau-data/ZkRollup.r1cs ptau-data/pot14_final.ptau ptau-data/ZkRollup_0000.zkey
snarkjs zkey contribute ptau-data/ZkRollup_0000.zkey ptau-data/ZkRollup_0001.zkey --name="ZK Rollup" -v
snarkjs zkey export verificationkey ptau-data/ZkRollup_0001.zkey ptau-data/verification_key.json

# Generate solidty contract
snarkjs zkey export solidityverifier ptau-data/ZkRollup_0001.zkey contracts/Groth16Verifier.sol