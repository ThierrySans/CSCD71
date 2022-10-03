// SPDX-License-Identifier: GPL-3.0
// @title A contract that sells VIP Passes
// @author David Liu, Founder of dApp Technology Inc.

pragma solidity >=0.7.0 <0.9.0;

import "./4_VipPass.sol";

/**
 * @title VipPassSale
 * @dev A medium to sell Digital Vip Pass
 */
contract VipPassSale {

    // A sale of VIP Passes
    struct Sale {
        uint256 price; // Price of one pass in Wei
        uint256 supplyLeft; // Amount of passes unsold
        address seller; // The account that made the sale
    }

    uint256 salesIdCounter; // An incremental counter for keeping unique sales ids 

    // (salesId => Sale)
    mapping(uint256 => Sale) public sales;

    // the VIP Pass contract
    VipPass public vipPass;

    // A new sale has been created
    event SaleCreation(uint256 supply, uint256 price, address indexed seller);

    // A purchase has occured
    event SaleTransacted(uint256 saleQuantity, uint256 indexed saleId, uint256 supplyLeft, address indexed seller);

    /**
     * @dev Sets the VIP Pass Contract
     * @param vipPassContract the contract representing the digital VIP Pass
     */
    constructor(address vipPassContract) {
        vipPass = VipPass(vipPassContract);
    }

    /**
     * @dev Create a new VIP Pass Sale
     * @param supply the amount of VIP Passes to sell
     * @param price unit price of a VIP Pass
     */
    function createSale(uint256 supply, uint256 price) public {
        vipPass.transfer(msg.sender, address(this), supply);
        salesIdCounter += 1;
        sales[salesIdCounter] = Sale({
            price: price,
            supplyLeft: supply,
            seller: msg.sender
        });

        emit SaleCreation(supply, price, msg.sender);
    }

    /**
     * @dev Buy an amount of VIP Passes from a sale
     * @param salesId Unique id of the sale to buy from
     * @param buyAmt Amount of VIP Passes to buy
     */
    function buyFromSale(uint256 salesId, uint256 buyAmt) public payable {
        require(sales[salesId].supplyLeft >= buyAmt, "Not enough VIP Passes in this sale");
        require(msg.value ==  sales[salesId].price * buyAmt, "Not enough ETH sent");

        sales[salesId].supplyLeft -= buyAmt;

        vipPass.transfer(address(this), msg.sender, buyAmt);

        // sending the ETH to seller
        // Note: 2nd variable undeclared as the 2nd return value is not used
        (bool sent,) = sales[salesId].seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit SaleTransacted(buyAmt, salesId, sales[salesId].supplyLeft, sales[salesId].seller);
    }
}