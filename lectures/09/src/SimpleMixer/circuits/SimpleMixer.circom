pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";

template SimpleMixer(levels) {
    
    // private inputs
    signal input secret;
    signal input treeSiblings[levels];
    signal input treePathIndices[levels];
    
    // public inputs
    signal input nullifier;
    signal input address;
    
    // output (considered as public inputs)
    signal output root;
    signal output authHash;
    
    component secretHasher = Poseidon(2);
    secretHasher.inputs <== [secret, nullifier];
    
    component tree = MerkleTreeInclusionProof(levels);
    tree.leaf <== secretHasher.out;
    for (var i = 0; i < levels; i++) {
        tree.siblings[i] <== treeSiblings[i];
        tree.pathIndices[i] <== treePathIndices[i];
    }
    
    root <== tree.root;
    
    component authHasher = Poseidon(3);
    authHasher.inputs <== [secret, nullifier, address];
    authHash <== authHasher.out;
}

component main {public [address, nullifier]} = SimpleMixer(20);
