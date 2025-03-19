#!/bin/bash

rm contracts/RollupVerifier.sol
rm contracts/UpdateVerifier.sol

rm -Rf zksetup
mkdir zksetup

# compile circom
circom circuits/Update.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/Update.r1cs ptau-data/pot20_final.ptau zksetup/Update.zkey
snarkjs zkey export verificationkey zksetup/Update.zkey zksetup/update_key.json
rm -f zksetup/Update.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/Update.zkey contracts/UpdateVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract UpdateVerifier/" contracts/UpdateVerifier.sol

# compile circom
circom circuits/Rollup.circom --r1cs --wasm -o zksetup/

# Phase 2 (contract specific)
snarkjs groth16 setup zksetup/Rollup.r1cs ptau-data/pot20_final.ptau zksetup/Rollup.zkey
snarkjs zkey export verificationkey zksetup/Rollup.zkey zksetup/rollup_key.json
rm -f zksetup/Rollup.r1cs

# Generate solidty contract
snarkjs zkey export solidityverifier zksetup/Rollup.zkey contracts/RollupVerifier.sol
sed -i "" "s/contract Groth16Verifier/contract RollupVerifier/" contracts/RollupVerifier.sol