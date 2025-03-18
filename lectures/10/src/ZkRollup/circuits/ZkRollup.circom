pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";

template ZkRollup(levels, max_users, max_transactions) {
    
    // Transactions
    signal input from[max_transactions];
    signal input to[max_transactions];
    signal input amount[max_transactions];
    signal output balanceIsGreaterThanAmmount[max_transactions];
    
    // Balances
    signal input oldBalances[max_users];
    signal input newBalances[max_users];
    
    // Merkle Tree
    signal input root;
    signal input treeSiblings[levels];
    signal input treePathIndices[levels];

    // Components
    component tree[max_users];
    component balanceHasher[max_users];

    // Variables (mutations)
    var intermediate[max_users];
    
    for (var i = 0; i < max_users; i++) {
        intermediate[i] = oldBalances[i];
    }

    for (var i = 0; i < max_transactions; i++) {
         balanceIsGreaterThanAmmount[i] <-- (from[i] == 0 || amount[i]<=intermediate[from[i]])? 1 : 0;
         balanceIsGreaterThanAmmount[i] === 1;
         if (from[i] != 0){
            intermediate[from[i]] -= amount[i];
         }
         if (to[i] != 0){
             intermediate[to[i]] += amount[i];
         }
    }
    
    for (var i = 0; i < max_users; i++) {
        newBalances[i] === intermediate[i];
    }

    for (var i = 0; i < max_users; i++) {
         balanceHasher[i] = Poseidon(2);
         balanceHasher[i].inputs <== [i, newBalances[i]];
    
         tree[i] = MerkleTreeInclusionProof(levels);
         tree[i].leaf <== balanceHasher[i].out;
         for (var k = 0; k < levels; k++) {
             tree[i].siblings[k] <== treeSiblings[k];
             tree[i].pathIndices[k] <== treePathIndices[k];
         }
         
         root === tree[i].root;
    }
}

component main {public [from, to, amount, oldBalances, newBalances, root, treeSiblings, treePathIndices]} = ZkRollup(5, 32, 100);
