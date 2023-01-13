// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// Do nothing contract
contract DoNothingContract {
    event GasUsed(uint256 addr);

    function costlyTransaction(uint256 loops) public {

        emit GasUsed(loops);
    }
}
