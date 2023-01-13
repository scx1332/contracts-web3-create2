// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// Do nothing contract
contract DoNothingContract {
    event GasUsed(uint256 init, uint256 end);

    function costlyTransaction(uint256 loops, uint256 init) public {


        while(loops > 0) {
            init = init * init;
            loops -= 1;
        }

        emit GasUsed(init, block.basefee);
    }
}
