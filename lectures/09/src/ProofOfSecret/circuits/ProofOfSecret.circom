pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template ProofOfSecret() {
    // private inputs
    signal input secret;
    
    // output (considered as public inputs)
    signal output secretHash;
    
    component secretHasher = Poseidon(1);
    secretHasher.inputs <== [secret];
    secretHash <==secretHasher.out;
}

component main = ProofOfSecret();
