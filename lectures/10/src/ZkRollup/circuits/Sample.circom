pragma circom 2.0.0;

template Sample(max_users, max_transactions) {
    
    // Transactions
    signal input from[max_transactions];
    signal input to[max_transactions];
    signal input amount[max_transactions];
    
    // Balances
    signal input oldBalances[max_users];
    signal input newBalances[max_users];

    // Variables (mutations)
    var intermediate[max_users];
    
    for (var i = 0; i < max_users; i++) {
        intermediate[i] = oldBalances[i];
    }

    for (var i = 0; i < max_transactions; i++) {
        intermediate[from[i]] -= amount[i];
        intermediate[to[i]] += amount[i];
    }
    
    for (var i = 0; i < max_users; i++) {
        newBalances[i] === intermediate[i];
    }
}

component main {public [from, to, amount, oldBalances, newBalances]} = Sample(32, 100);
