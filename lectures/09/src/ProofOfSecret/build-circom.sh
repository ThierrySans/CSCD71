#!/bin/bash

rm contracts/ProofOfSecretVerifier.sol
rm -Rf zksetup
mkdir zksetup

# compile circom
circom circuits/ProofOfSecret.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/ProofOfSecret.r1cs ../ptau-ceremony/pot14_final.ptau zksetup/ProofOfSecret.zkey
snarkjs zkey export verificationkey zksetup/ProofOfSecret.zkey zksetup/verification_key.json
rm -f zksetup/ProofOfSecret.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/ProofOfSecret.zkey contracts/ProofOfSecretVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract ProofOfSecretVerifier/" contracts/ProofOfSecretVerifier.sol