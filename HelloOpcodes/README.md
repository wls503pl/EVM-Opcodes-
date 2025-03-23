# EVM Basics

Since Opcodes directly manipulate EVM resources such as the stack, memory, and storage, it is important to understand the basics of EVM.<br>
Similar to Java's JVM, the runtime environment of Ethereum smart contracts is EVM. The basic architecture of EVM mainly includes stack, memory, storage, EVM bytecode, and fuel fee. Let's explain them one by one:
<br>

![EVM](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/EVM.png)<br>

1. Stack

The EVM is stack-based, which means that the way it handles data is by using a stack data structure for most calculations.<br>
A stack is a last-in-first-out (LIFO) data structure that is efficient and concise. You can think of it as a stack of plates. When you need to add a plate, you can only put it on the top of the stack,
which we call PUSH. When you need to take a plate, you can only take the top one, which we call POP. Many opcodes involve pushing data onto the stack or popping data off the stack.<br>

In the stack, each element is 256 bits (32 bytes) long and the maximum depth is 1024 elements, but each operation can only operate on the top 16 elements of the stack. This is why Solidity sometimes reports a Stack too deep error.
<br>

![stack](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/stack.png)<br>

2. Memory

Although the stack is computationally efficient, it has limited storage capacity, so the EVM uses memory to support data storage and reading during transaction execution.
The EVM's memory is a linearly addressed memory, which you can think of as a dynamic byte array that can be dynamically expanded as needed. It supports writing in 8 or 256 bits (MSTORE8/MSTORE), but only supports reading in 256 bits (MLOAD).<br>

It should be noted that the EVM memory is "volatile": at the beginning of a transaction, the values ​​of all memory locations are 0; during the transaction, the values ​​are updated; at the end of the transaction,
all data in the memory will be cleared and will not be persisted. If you need to save data permanently, you need to use EVM storage.
<br>

![memory](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/memory.png)<br>

3. Storage

EVM's Account Storage is a mapping (key-value pair storage), each key and value is 256 bits of data, and it supports 256 bits of reading and writing. This storage exists on each contract account and is persistent,
and its data will remain on the blockchain until it is explicitly modified.

Both reading (SLOAD) and writing (SSTORE) storage require gas and are more expensive than memory operations. This design prevents the abuse of storage resources because all storage data needs to be saved on each Ethereum node.
<br>

![storage](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/storage.png)<br>

4. EVM Bytecodes

As we mentioned before, Solidity smart contracts are compiled into EVM bytecode before they can be run on the EVM. This bytecode is composed of a series of Opcodes, usually expressed as a string of hexadecimal numbers. When the EVM bytecode is executed,
each Opcode is read and executed one by one in sequence.

For example, the bytecode 6001600101 can be decoded as:

```
PUSH1 0x01
PUSH1 0x01
ADD
```

The meaning of this section of Opcodes is to add two 1s and get the result 2.

5. Gas

Gas is the "fuel" for executing transactions and running contracts in Ethereum. Each transaction or contract call consumes a certain amount of Gas, which depends on the complexity of the calculations they perform and the size of the data storage.
How is the gas cost of each transaction on EVM calculated? Actually, it is calculated through opcodes. Ethereum specifies the gas cost of each opcode. The more complex the opcodes, the more gas they consume. For example:

- **ADD** operation consumes 3 gas
- **SSTORE** operation consumes 20,000 gas
- **SLOAD** operation consumes 200 Gas

The gas consumption of a transaction is equal to the sum of the gas costs of all opcodes in it. When you call a contract function, you need to estimate the Gas required for the function to execute and provide enough Gas in the transaction.
If the Gas provided is not enough, the function execution will be stopped midway and the consumed Gas will not be refunded.
<br>

![Gas](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/gas.png)<br>

6. Execution Model

Finally, let's connect the above content and introduce the EVM execution model. It can be summarized into the following steps:<br>
1. When a transaction is received and ready to be executed, Ethereum initializes a new execution environment and loads the contract's bytecode.
2. Bytecodes are translated into Opcodes and executed one by one. Each Opcode represents an operation, such as arithmetic operation, logical operation, storage operation or jump to other opcodes.
3. Each execution of an Opcode consumes a certain amount of Gas. If the Gas is exhausted or an error occurs, the execution stops immediately and all state changes (except the consumed Gas) are rolled back.
4. After execution is completed, the results of the transaction will be recorded on the blockchain, including information such as Gas consumption and transaction logs.

<br>

![ExecModel](https://github.com/wls503pl/EVM-Opcodes-/blob/main/img/execModel.png)<br>

<hr>

# Summary

In this lecture, we introduced the basics of EVM and Opcodes. In subsequent tutorials, we will continue to learn Opcodes!
