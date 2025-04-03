# Abstruct

In this chapter, we will introduce 8 instructions for bit-level operations in the EVM, including AND, OR, and XOR. And, we will add support for them in a minimalist version of the EVM written in Python.

## AND

The AND instruction pops two elements from the stack, performs a bitwise AND operation on them, and pushes the result onto the stack. The opcode is 0x16 and the gas cost is 3.
We add the implementation of the AND instruction to our EVM simulator:

```
def and_op(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(a & b)
```

We add processing for the AND instruction in the _**run()**_ function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    # ... processing of other instructions ...
    elif op == ADD:      # handle ADD instruction
      self.and_op()
```

Now, we can try to run a bytecode containing an AND instruction: 0x6002600316 (PUSH1 2 PUSH1 3 AND). This bytecode pushes 2 (0000 0010) and 3 (0000 0011) onto the stack, and then performs a bitwise AND operation, which should result in 2 (0000 0010).

```
code = b"\x60\x02\x60\x03\x16"
evm = EVM(code)
evm.run()
print(evm.stack)
# output:[2]
```

## OR

The OR instruction is similar to the AND instruction, but performs a bitwise OR operation. The opcode is 0x17 and the gas cost is 3.
We add the implementation of the OR instruction to the EVM simulator:

```
def or_op(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(a | b)
```

We add processing for the OR instruction in the run() function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    # ... processing of other instructions ...
    elif op == OR:      # handle OR instruction
      self.or_op()
```

Now, we can try to run a bytecode containing an OR instruction: 0x6002600317 (PUSH1 2 PUSH1 3 OR). This bytecode pushes 2 (0000 0010) and 3 (0000 0011) onto the stack, and then performs a bitwise AND operation, which should result in 3 (0000 0011).

```
code = b"\x60\x02\x60\x03\x17"
evm = EVM(code)
evm.run()
print(evm.stack)
# outpit: [3]
```

## XOR

The XOR instruction is similar to the AND and OR instructions, but performs an exclusive OR operation. The opcode is 0x18 and the gas cost is 3.
We add the implementation of the XOR instruction to the EVM simulator:

```
def xor_op(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(a ^ b)
```

We add processing for the XOR instruction in the _**run()**_ function:

```
def run(self):
  while self.pc < len(self.code):
    op = next_instruction()

  # processing other instructions
  elif op = XOR:
    self.xor_op()
```

Now, we can try to run a bytecode that contains a XOR instruction: 0x6002600318 (PUSH1 2 PUSH1 3 XOR). This bytecode pushes 2 (0000 0010) and 3 (0000 0011) onto the stack, and then performs a bitwise AND operation, which should result in 1 (0000 0001).

```
code = b"\x60\x03\x60\x02\x18"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [1]
```

The NOT instruction performs a bitwise NOT operation, takes the complement of the top element of the stack, and pushes the result back to the top of the stack. Its opcode is 0x19 and the gas cost is 3.
We add the implementation of the NOT instruction to the EVM simulator:

```
def not_op(self):
  if len(self.stack) < 1:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  self.stack.append(~a % (2**256))      # # The result of the bitwise NOT operation needs to be modulo 2^256 to prevent overflow
```

Add processing for the NOT instruction in the _**run()**_ function:

```
def run(self):
    while self.pc < len(self.code):
      op = self.next_instruction()

    # ... Processing of other instructions ...
    elif op == NOT:      # Processing XOR Instructions
      self.not_op()
```

Now, we can try to run a bytecode containing a NOT instruction: 0x600219 (PUSH1 2 NOT). This bytecode pushes 2 (0000 0010) onto the stack, and then performs a bitwise NOT operation,
which should result in a very large number (0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd).

```
# NOT
code = b"\x60\x02\x19"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: (fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd)
```

## SHL

The SHL instruction performs a left shift operation, popping two elements from the stack, shifting the second element left by the number of bits of the first element, and then pushing the result back to the top of the stack.
Its opcode is 0x1B and the gas cost is 3. We add the implementation of the SHL instruction to the EVM simulator:

```
def shl(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append((b << a) % (2**256))      # The result of the left shift operation needs to be modulo 2^256
```

Add processing for SHL instructions in the _**run()**_ function:

```
elif op == SHL:      # Processing SHL instructions
  self.shl()
```

Now, we can try to run a bytecode that contains an XOR instruction: 0x600260031B (PUSH1 2 PUSH1 3 SHL). This bytecode pushes 2 (0000 0010) and 3 (0000 0011) onto the stack, and then shifts 2 left by 3 bits, which should give us 16 (0001 0000).

```
code = b"\x60\x02\x60\x03\x1B"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [16] (0x000000010 << 3 => 0x00010000)
```

## SHR

The SHR instruction performs a right shift operation, popping two elements from the stack, shifting the second element right by the number of bits of the first element, and then pushing the result back to the top of the stack. Its opcode is 0x1C and the gas cost is 3. We add the implementation of the SHR instruction to the EVM simulator:

```
def shr(self):
    if len(self.stack) < 2:
        raise Exception('Stack underflow')
    a = self.stack.pop()
    b = self.stack.pop()
    self.stack.append(b >> a)      # Right shift operation
```

Add processing for the SHR instruction in the run() function:

```
elif op == SHR: # Process SHR instruction
  self.shr()
```

Now, we can try to run a bytecode that contains an XOR instruction: 0x601060031C (PUSH1 16 PUSH1 3 SHL). This bytecode pushes 16 (0001 0000) and 3 (0000 0011) onto the stack, and then shifts 16 right by 3 bits, which should give us 2 (0000 0010).

```
code = b"\x60\x10\x60\x03\x1C"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [2] (00010000 >> 3 => 0x000000010)
```

## Other bit-level instructions

1. **BYTE**: The BYTE instruction pops two elements (a and b) from the stack, treats the second element (b) as a 32-byte array, fills in 0s if there are not enough digits, and returns the byte at the ath index starting from the high bit in the byte array, that is, (b[31-a]), and pushes it into the stack. If index a is greater than or equal to 32, it returns 0, otherwise it returns b[31-a]. The opcode is 0x1a and the gas consumption is 3.

```
def byte_op(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')
  position = self.stack.pop()
    value = self.stack.pop()
  if position >= 32:
    res = 0
  else:
    res = (value // pow(256, 31 - position)) & 0xFF
  self.stack.append(res)
```

2. **SAR**: The SAR instruction performs an arithmetic right shift, similar to SHR, but takes the sign bit into account: if we perform an arithmetic right shift on a negative number, the leftmost (sign bit) is filled with F during the right shift to keep the negative value of the number. It pops two elements from the stack, shifts the second element right by the number of the first element with the sign bit filled, and then pushes the result back to the top of the stack. Its opcode is 0x1D and the gas cost is 3. Since Python's >> operator is already an arithmetic right shift, we can directly reuse the code of the shr function.

```
def sar(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')
  a = self.stack.pop()
  b = self.stack.pop()
    self.stack.append(b >> a)      # Right shift operation
```

# Summary

In this chapter, we introduced 8 bit-level instructions in EVM and added support for them in the minimalist version of EVM. Exercises: Write the instruction form corresponding to 0x6002600160011B1B and give the stack status after running.
