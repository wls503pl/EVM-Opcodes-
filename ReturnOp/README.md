# Abstruct

In this chapter, we will introduce three instructions related to return data in EVM: RETURN, RETURNDATASIZE, and RETURNDATACOPY. They are the basis of the return keyword in Solidity.

## Return data

The return data of EVM, usually called returnData, is essentially a byte array. It does not follow a fixed data structure, but is simply represented as consecutive bytes. When a contract function needs to return complex data types (such as structures or arrays),
these data will be encoded as bytes according to the ABI specification and stored in returnData for access by other functions or contracts. To support this feature, we need to add a new property to our simplified EVM to save the return data:

```
class EVM:
  def __init__(self):
  # ... other properties ...
  self.returnData = bytearray()
```

## Return related instructions

1. RETURN

- **Opcode**: 0xF3
- **Gas consumption**: memory expansion cost.
- **Function**: extract data from the specified memory location, store it in returnData, and terminate the current operation. This instruction needs to take two parameters from the stack: the starting location of the memory mem_offset and the length of the data length.
- **Use scenario**: when data needs to be returned to an external function or transaction.

```
def return_op(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  mem_offset = self.stack.pop()
  length = self.stack.pop()

  # Expand Memory
  if len(self.memory) < mem_offset + length:
    self.memory.extend([0] * (mem_offset + length - len(self.memory)))

  self.returnData = self.memory[offset:offset + length]
```

2. RETURNDATASIZE

- **Opcode**: 0x3D
- **Gas consumption**: 2
- **Function**: Push the size of returnData onto the stack.
- **Use scenario**: Use the data returned by the previous call.

```
def returndatasize(self):
    self.stack.append(len(self.returnData))
```

3. RETURNDATACOPY

- **Opcode**: 0x3E
- **Gas consumption**: 3 + 3 * data length + memory expansion cost
- **Function**: copy a segment of data in returnData to memory. This instruction needs to take three parameters from the stack: the starting position of the memory mem_offset, the starting position of the returned data return_offset, and the length of the data length.
- **Usage scenario**: use part of the data returned by the previous call.

```
def returndatacopy(self):
    if len(self.stack) < 3:
        raise Exception('Stack underflow')

    mem_offset = self.stack.pop()
    return_offset = self.stack.pop()
    length = self.stack.pop()

    if return_offset + length > len(self.returnData):
        raise Exception("Invalid returndata size")

    # Expanded Memory
    if len(self.memory) < mem_offset + length:
        self.memory.extend([0] * (mem_offset + length - len(self.memory)))

    # Copying using slices
    self.memory[mem_offset:mem_offset + length] = self.returnData[return_offset:return_offset + length]
```

## Test

1. RETURN: We run a bytecode containing a RETURN instruction: 60a26000526001601ff3 (PUSH1 a2 PUSH1 0 MSTORE PUSH1 1 PUSH1 1f RETURN). This bytecode stores a2 in memory and then uses the RETURN instruction to copy a2 to returnData.

```
# RETURN
code = b"\x60\xa2\x60\x00\x52\x60\x01\x60\x1f\xf3"
evm = EVM(code)
evm.run()
print(evm.returnData.hex())
# output: a2
```

2. RETURNDATASIZE: We set returnData to aaaa and then push its length onto the stack using RETURNDATASIZE.

```
# RETURNDATASIZE
code = b"\x3D"
evm = EVM(code)
evm.returnData = b"\xaa\xaa"
evm.run()
print(evm.stack)
# output: 2
```

3. RETURNDATACOPY: We set returnData to aaaa, and then run a bytecode containing the RETURNDATACOPY instruction: 60025F5F3E (PUSH1 2 PUSH0 PUSH0 RETURNDATACOPY) to store the return data into memory.

```
# RETURNDATACOPY
code = b"\x60\x02\x5F\x5F\x3E"
evm = EVM(code)
evm.returnData = b"\xaa\xaa"
evm.run()
print(evm.memory.hex())
# output: aaaa
```

<hr>

# Summary

In this chapter, we learned three instructions related to returning data in EVM: RETURN, RETURNDATASIZE, and RETURNDATACOPY, and added support for these instructions to the minimal EVM through code examples. Currently, we have learned 134 (93%) of the 144 opcodes!
