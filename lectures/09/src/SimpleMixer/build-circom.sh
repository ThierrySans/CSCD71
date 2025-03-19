#!/bin/bash

rm contracts/SimpleMixerVerifier.sol
rm -Rf zksetup
mkdir zksetup

# compile circom
circom circuits/SimpleMixer.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/SimpleMixer.r1cs ../ptau-data/pot14_final.ptau zksetup/SimpleMixer.zkey
snarkjs zkey export verificationkey zksetup/SimpleMixer.zkey zksetup/verification_key.json
rm -f zksetup/SimpleMixer.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/SimpleMixer.zkey contracts/SimpleMixerVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract SimpleMixerVerifier/" contracts/SimpleMixerVerifier.sol