pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template ProofOfSecret() {
    signal input secret;
    signal output hash;
    
    component hasher = Poseidon(1);
    hasher.inputs <== [secret];
    hash <== hasher.out;
}

component main = ProofOfSecret();
