#!/bin/bash

rm contracts/SimplePasswordVerifier.sol
rm -Rf zksetup
mkdir zksetup

# compile circom
circom circuits/SimplePassword.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/SimplePassword.r1cs ../ptau-ceremony/pot14_final.ptau zksetup/SimplePassword.zkey
snarkjs zkey export verificationkey zksetup/SimplePassword.zkey zksetup/verification_key.json
rm -f zksetup/SimplePassword.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/SimplePassword.zkey contracts/SimplePasswordVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract SimplePasswordVerifier/" contracts/SimplePasswordVerifier.sol