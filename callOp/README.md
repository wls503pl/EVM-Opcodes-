# Abstruct

In this chapter, we will introduce the CALL instruction in EVM. The CALL instruction can be regarded as the core of Ethereum. It allows contracts to interact with each other, making the contracts on the blockchain no longer isolated.

## CALL instruction

The CALL instruction creates a sub-environment to execute part of the code of other contracts, send ETH, and return data. The return data can be obtained using RETURNDATASIZE and RETURNDATACOPY. If the execution is successful, 1 will be pushed into the stack;
otherwise, 0 will be pushed. If the target contract has no code, 1 will still be pushed into the stack (considered successful). If the account ETH balance is less than the amount of ETH to be sent, the call fails, but the current transaction will not be rolled back.

It pops 7 parameters from the stack, in order:<br>

- **gas**: The amount of gas allocated for this call.
- **to**: The address of the called contract.
- **value**: The amount of ether to send, in wei.
- **mem_in_start**: The starting position of the input data (calldata) in memory.
- **mem_in_size**: The length of the input data.
- **mem_out_start**: The starting position of the return data (returnData) in the memory.
- **mem_out_size**: the length of the returned data
