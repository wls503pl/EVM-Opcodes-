# Abstruct

In this Chapter, we will introduce four instructions for memory operations in EVM, including MSTORE, MSTORE8, MLOAD, and MSIZE. We will add support for these operations in a minimalist version of EVM written in Python.

## Memory in the EVM

The memory of EVM is a linear addressable memory, similar to a dynamic byte array, which can be dynamically expanded according to demand. Another feature of it is volatility, and all data will be cleared at the end of the transaction. It supports writing in 8 or 256 bits (MSTORE8/MSTORE), but only supports reading in 256 bits (MLOAD).

We can use Python's built-in **bytearray** to represent memory:

```
def __init__(self, code):
    self.code = code
    self.pc = 0
    self.stack = []
    self.memory = bytearray()  # Initialize the memory to empty
```

Reading and writing memory is much cheaper than reading and writing storage. There is a fixed fee of 3 gas for each read and write. In addition, if a new memory location is accessed for the first time (memory expansion), an additional fee (determined by the current offset and the historical maximum offset) must be paid. The calculation method is shown in the [link](https://www.evm.codes/about#accesssets).

## MSTORE (Memory Write)

The **MSTORE** instruction is used to store a 256-bit (32-byte) value into memory. It pops two elements from the stack, the first element is the address of the memory (offset), and the second element is the stored value (value). The opcode is 0x52, and the gas consumption is calculated based on the actual memory usage (3+X).

```
def mstore(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')
  offset = self.stack.pop()
  value = self.stack.pop()
  while len(self.memory) < offset + 32:
    self.memory.append(0)      # Memory Expansion
  self.memory[offset:offset+32] = value.to_bytes(32, 'big')
```

We add processing for the MSTORE instruction in the run() function:

```
def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()

      # ... Processing of other instructions ...

        elif op == MSTORE:    # Process the MSTORE instruction
            self.mstore()
```

Now, we can try to run a bytecode containing an MSTORE instruction: 0x6002602052 (PUSH1 2 PUSH1 0x20 MSTORE). This bytecode pushes 2 and 0x20 (32) onto the stack, then performs an MSTORE, storing 2 at offset 0x20.

```
# MSTORE
code = b"\x60\x02\x60\x20\x52"
evm = EVM(code)
evm.run()
print(evm.memory[0x20:0x40])  
# output: [0, 0, 0, ..., 0, 2]
```

## MSTORE8 (memory 8-bit write)

The **MSTORE8** instruction is used to store an 8-bit (1-byte) value into memory. Similar to MSTORE, but only the lowest 8 bits are used. The opcode is 0x53, and the gas consumption is calculated based on the actual memory usage (3+X).

```
def mstore8(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')
  offset = self.stack.pop()
  value = self.stack.pop()
  while len(self.memory) < offset + 32:
    self.memory.append(0)      # memory expansion
  self.memory[offset] = value & 0xFF      # take the least significant byte
```

We add processing for the MSTORE8 instruction in the run() function:

```
elif op == MSTORE8:      # Process MSTORE8 instruction
  self.mstore8()
```

Now, we can try to run a bytecode containing the MSTORE8 instruction: 0x6002602053 (PUSH1 2 PUSH1 0x20 MSTORE8). This bytecode pushes 2 and 0x20 (32) onto the stack, then performs MSTORE8, storing 2 at offset 0x20.

```
# MSTORE8
code = b"\x60\x02\x60\x20\x53"
evm = EVM(code)
evm.run()
print(evm.memory[0x20:0x40])  
# output: [2, 0, 0, ..., 0, 0]
```

## MLOAD (Memory Read)

The **MLOAD** instruction loads a 256-bit value from memory and pushes it onto the stack. It pops an element from the stack, loads 32 bytes from the memory address represented by the element, and pushes it onto the stack. The opcode is 0x51, and the gas consumption is calculated based on the actual memory usage (3+X).

```
def mload(self):
  if len(self.stack) < 1:
    raise Exception('Stack underflow')
  offset = self.stack.pop()
  while len(self.memory) < offset + 32:
    self.memory.append(0)      # Memory Expansion
  value = int.from_bytes(self.memory[offset:offset+32], 'big')
  self.stack.append(value)
```

We add processing for the MLOAD instruction in the run() function:

```
elif op == MLOAD: 
    self.mload()
```

Now, we can try to run a bytecode containing an MLOAD instruction: 0x6002602052602051 (PUSH1 2 PUSH1 0x20 MSTORE PUSH1 0x20 MLOAD). This bytecode pushes 2 and 0x20 (32) onto the stack, then performs MSTORE to store 2 at offset 0x20; then pushes 0x20 onto the stack, and then performs MLOAD to read the value just stored in memory.

```
# MSTORE
code = b"\x60\x02\x60\x20\x52\x60\x20\x51"
evm = EVM(code)
evm.run()
print(evm.memory[0x20:0x40])  
# output: [0, 0, 0, ..., 0, 2]
print(evm.stack)  
# output: [2]
```

## MSIZE (memory size)

The MSIZE instruction pushes the current memory size (in bytes) onto the stack. The opcode is 0x59 and the gas cost is 2.

```
def msize(self):
    self.stack.append(len(self.memory))
```

