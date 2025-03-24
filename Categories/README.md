# Abstruct

In this chapter, we will introduce the classification of Opcodes, classify Opcodes, and use these opcodes to create a simple program to perform 1+1 calculation.

## Opcodes Categories

Opcodes can be divided into the following categories based on their functions:

- **Stack** instructions: These instructions directly manipulate the EVM stack. This includes pushing elements onto the stack (such as PUSH1) and popping elements from the stack (such as POP).
- **Arithmetic** instructions: These instructions are used to perform basic mathematical operations in the EVM, such as addition (ADD), subtraction (SUB), multiplication (MUL), and division (DIV).
- **Comparison** instructions: These instructions are used to compare the two top elements of the stack. For example, greater than (GT) and less than (LT).
- **Bitwise** instructions: These instructions are used to manipulate data at the bit level. For example, bitwise AND and bitwise OR.
- **Memory** instructions: These instructions are used to operate the EVM's memory. For example, read data from memory to the stack (MLOAD) and store data from the stack to memory (MSTORE).
- **Storage** instructions: These instructions are used to operate the EVM account storage. For example, reading data from storage to the stack (SLOAD) and saving data from the stack to storage (SSTORE).
  The gas consumption of these instructions is greater than that of memory instructions.
- **Control Flow** Instructions: These instructions are used for EVM control flow operations, such as JUMP and JUMPDEST.
- **Context** commands: These commands are used to obtain context information about transactions and blocks. For example, get msg.sender (CALLER) and the currently available gas (GAS)

## evm.codes

1. Opcode List

evm.codes provides a complete list of Opcodes, which includes each Opcode's number (e.g., ADD is 0x01), name, gas cost, stack inputs and outputs, and a short description.
<br>

![]()<br>

2. Playground

evm.codes also provides an online Opcodes [playground](https://www.evm.codes/playground) where you can run Opcodes code. The playground is divided into three parts: the editor in the upper left corner, the execution interface in the upper right corner,
and the status interface in the lower right corner, which respectively display your code, the execution process of the code, and the execution results.
<br>

![]()<br>

## Example: 1+1

Let's now use Opcodes to write a simple program that will calculate 1+1 in the stack and save the result to memory. The code is as follows:

```
PUSH1 0x01
PUSH1 0x01
ADD
PUSH0
MSTORE
```

Let's analyze this program line by line, showing the state of the stack and memory after each instruction is executed:

1. Lines 1-2: The PUSH1 instruction pushes a 1-byte data onto the top of the stack.

```
PUSH1 0x01
// stack: [1]
PUSH1 0x01
// stack: [1, 1]
```

2. Line 3: The ADD instruction pops the top two elements of the stack, calculates their sum, and pushes the result onto the stack.

```
ADD
// stack: [2]
```

3. Line 4: The PUSH0 instruction pushes 0 onto the stack.

```
PUSH0
// stack: [0, 2]
```

4. Line 5: MSTORE is a memory instruction. It pops the two data [offset, value] (offset and value) at the top of the stack, and then saves value (32 bytes in length) to the location where the memory index (offset) is offset.

```
MSTORE
// stack: []
// memory: [0: 2]
```

You can verify the execution process and results in evm.codes.
<br>

![]()<br>
