#!/bin/bash

rm -Rf ptau-data
mkdir ptau-data

# Powers of Tau
snarkjs powersoftau new bn128 14 ptau-data/pot14_0000.ptau -v
snarkjs powersoftau contribute ptau-data/pot14_0000.ptau ptau-data/pot14_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 ptau-data/pot14_0001.ptau ptau-data/pot14_final.ptau -v