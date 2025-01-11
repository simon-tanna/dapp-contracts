// Deposit and withdraw funds from the exchange
// Manage orders - Make or cancel
// Handle trades - Charge fees

// TODO:
// [x] Set the fee account
// [ ] Deposit funds
// [ ] Withdraw funds
// [ ] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make orders
// [ ] Cancel orders
// [ ] Fill orders
// [ ] Charge fees

// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./Token.sol";

contract Exchange {
    // Variables
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount); // Send tokens to this contract
            // Manage deposit - update balance
            // Send tokens to this contract
            // Emit deposit event
    }
}
