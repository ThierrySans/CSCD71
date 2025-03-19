#!/bin/bash

rm contracts/ProofOfMembershipVerifier.sol
rm -Rf zksetup
mkdir zksetup

# compile circom
circom circuits/ProofOfMembership.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/ProofOfMembership.r1cs ../ptau-data/pot14_final.ptau zksetup/ProofOfMembership.zkey
snarkjs zkey export verificationkey zksetup/ProofOfMembership.zkey zksetup/verification_key.json
rm -f zksetup/ProofOfMembership.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/ProofOfMembership.zkey contracts/ProofOfMembershipVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract ProofOfMembershipVerifier/" contracts/ProofOfMembershipVerifier.sol