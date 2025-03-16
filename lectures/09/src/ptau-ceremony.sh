#!/bin/bash

rm -Rf ptau-ceremony
mkdir ptau-ceremony

# Powers of Tau
snarkjs powersoftau new bn128 14 ptau-ceremony/pot14_0000.ptau -v
snarkjs powersoftau contribute ptau-ceremony/pot14_0000.ptau ptau-ceremony/pot14_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 ptau-ceremony/pot14_0001.ptau ptau-ceremony/pot14_final.ptau -v