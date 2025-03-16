pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";

template ProofOfMembership(levels) {
    
    // private inputs
    signal input secret;
    signal input treeSiblings[levels];
    signal input treePathIndices[levels];
    
    // output (considered as public inputs)
    signal output root;
    
    component secretHasher = Poseidon(1);
    secretHasher.inputs <== [secret];
    
    component tree = MerkleTreeInclusionProof(levels);
    tree.leaf <== secretHasher.out;
    for (var i = 0; i < levels; i++) {
        tree.siblings[i] <== treeSiblings[i];
        tree.pathIndices[i] <== treePathIndices[i];
    }
    
    root <== tree.root;
}

component main = ProofOfMembership(20);
