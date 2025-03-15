pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template ProofOfSecret() {
    
    // private inputs
    signal input secret;
    
    // public inputs
    signal input address;
    signal input amount;
    signal input nonce;
    
    // output (considered as public inputs)
    signal output secretHash;
    signal output authHash;
    
    component secretHasher = Poseidon(1);
    secretHasher.inputs <== [secret];
    secretHash <== secretHasher.out;
    
    component authHasher = Poseidon(4);
    authHasher.inputs <== [secret, address, amount, nonce];
    authHash <== authHasher.out;
    
}

component main {public [address, amount, nonce]} = ProofOfSecret();
