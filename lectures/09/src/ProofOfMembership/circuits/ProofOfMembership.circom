pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";

template ProofOfMembership(levels) {
    
    // private inputs
    signal input secret;
    signal input treeSiblings[levels];
    signal input treePathIndices[levels];
    
    // public inputs
    signal input address;
    signal input amount;
    signal input nonce;
    
    // output (considered as public inputs)
    signal output root;
    signal output authHash;
    
    component secretHasher = Poseidon(1);
    secretHasher.inputs <== [secret];
    
    component tree = MerkleTreeInclusionProof(levels);
    tree.leaf <== secretHasher.out;
    for (var i = 0; i < levels; i++) {
        tree.siblings[i] <== treeSiblings[i];
        tree.pathIndices[i] <== treePathIndices[i];
    }
    
    root <== tree.root;
    
    component authHasher = Poseidon(4);
    authHasher.inputs <== [secret, address, amount, nonce];
    authHash <== authHasher.out;
}

component main {public [address, amount, nonce]} = ProofOfMembership(20);
