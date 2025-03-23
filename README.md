# Ethereum Virtual Machine (EVM) Operation Codes

- Opcodes Introduction

Opcodes are the basic unit of Ethereum smart contracts. The Solidity smart contracts written by everyone will be compiled into bytecodes before they can be run on EVM (Ethereum Virtual Machine). The bytecode is composed of a series of Opcodes. When the user calls the function of this smart contract in EVM, EVM will parse and execute these Opcodes to implement the contract logic.<br>

Let's look at some common Opcodes:<br>

- **PUSH1**: Push a byte of data into the stack. For example, PUSH1 0x60 pushes 0x60 into the stack.
- **DUP1**: Duplicate an element at the top of the stack.
- **SWAP1**: Swap the first two elements at the top of the stack.

Below is a simple Solidity smart contract with only one _**add()**_ function that calculates the result of 1+1 and returns it.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Add {
    function add() public pure returns (uint256 result) {
        result = 1+1;
    }
}
```

After compiling the contract, we can get the bytecode corresponding to the contract:

```
6080604052348015600e575f80fd5b5060af80601a5f395ff3fe6080604052348015600e575f80fd5b50600436106026575f3560e01c80634f2be91f14602a575b5f80fd5b60306044565b604051603b91906062565b60405180910390f35b5f6002905090565b5f819050919050565b605c81604c565b82525050565b5f60208201905060735f8301846055565b9291505056fea2646970667358221220ec0a9152a89a3614a7161287469681b57d36a105b477a5f13699cdf817d2989464736f6c634300081a0033
```

Through bytecode, we can get the opcodes corresponding to the contract:

```
PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ...
```

<br>

![transferBytecodes](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/transferBytecodes.png)<br>

If you want to understand what these opcodes are doing, this is what we are going to do next.
