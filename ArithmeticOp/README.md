# Abstruct

In this chapter, we will introduce 11 instructions for basic arithmetic operations in the EVM, including **ADD** (addition), **MUL** (multiplication), **SUB** (subtraction), and **DIV** (division).
And, we will add support for them in a minimalist version of the EVM written in Python.

## ADD (Addition)

The **ADD** instruction pops two elements from the stack, adds them, and pushes the result into the stack. If the stack does not have two elements, an exception is thrown. The opcode for this instruction is 0x01 and the gas cost is 3.<br>
We can add an implementation of the ADD instruction to our EVM simulator:

```
def add(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')
  a = self.stack.pop()
  b = self.stack.pop()
  res = (a + b) % (2 ** 256)      # # The addition result needs to be modulo 2^256 to prevent overflow
  self.stack.append(res)
```

We add processing for the ADD instruction in the _**run()**_ function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    if PUSH1 <= op <= PUSH32:
      size = op - PUSH1 + 1
      self.push(size)
    elif op == PUSH0:
      self.stack.append(0)
      self.pc += size
    elif op == POP:
      self.pop()
    elif op == ADD: # Process ADD instruction
      self.add()
```

Now, we can try to run a bytecode that contains an ADD instruction: 0x6002600301 (PUSH1 2 PUSH1 3 ADD). This bytecode pushes 2 and 3 onto the stack and then adds them.

```
code = b"\x60\x02\x60\x03\x01"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [5]
```

## MUL (Multiplication)

The MUL instruction is similar to **ADD**, but it multiplies the top two elements of the stack. The opcode is 0x02 and the gas cost is 5.

We add the implementation of the MUL instruction to the EVM simulator:

```
def mul(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')
  a = self.stack.pop()
  b = self.stack.pop()
  res = (a * b) % (2**256)      # The multiplication result needs to be modulo 2^256 to prevent overflow
  self.stack.append(res)
```

We add processing for the MUL instruction in the run() function:

```
def run(self):
    while self.pc < len(self.code):
      op = self.next_instruction()

    if PUSH1 <= op <= PUSH32:
      size = op - PUSH1 + 1
      self.push(size)
    elif op == PUSH0:
      self.stack.append(0)
      self.pc += size
    elif op == POP:
      self.pop()
    elif op == ADD:
      self.add()
    elif op == MUL:      # handle MUL instruction
      elf.mul()
```

Now, we can try to run a bytecode that contains a MUL instruction: 0x6002600302 (PUSH1 2 PUSH1 3 MUL). This bytecode pushes 2 and 3 onto the stack and then multiplies them.

```
code = b"\x60\x02\x60\x03\x02"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [6]
```

## SUB (Subtraction)

The SUB instruction pops two elements from the top of the stack, then calculates the first element minus the second element, and finally pushes the result onto the stack. The opcode of this instruction is 0x03, and the gas cost is 3. We add the implementation of the SUB instruction to the EVM simulator:

```
def sub(self):
  if len(stack.size) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  res = (a - b) % (2**256)      # The result needs to be modulo 2^256 to prevent overflow
  self.stack.append(res)
```

We add processing for the SUB instruction in the run() function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

  if PUSH1 <= op <= PUSH32:
    size = op - PUSH1 + 1
    self.push(size)

  elif op == PUSH0:
    self.stack.append(0)
    self.pc += size

  elif op == POP:
    self.pop()

  elif op == ADD:
    self.add()

  elif op == MUL:
    self.mul()

  elif op == SUB:
    self.sub()
```

Now, we can try to run a bytecode containing a SUB instruction: 0x6002600303 (PUSH1 2 PUSH1 3 SUB). This bytecode pushes 2 and 3 onto the stack and then subtracts them (3-2).

```
code = b"\x60\x02\x60\x03\x03"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [1]
```

## DIV (Division)

The DIV instruction pops two elements from the top of the stack, divides the first element by the second element, and pushes the result onto the stack. If the second element (the divisor) is 0, 0 is pushed onto the stack. The opcode for this instruction is 0x04 and the gas cost is 5. We add the implementation of the DIV instruction to the EVM simulator:

```
def div(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')
  a = self.stack.pop()
  b = self.stack.pop()
  if b == 0:
    res = 0
  else:
    res =  (a // b) % (2**256)
  self.stack.append(res)
```

We add processing for the DIV directive in the run() function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    if PUSH1 <= op <= PUSH32:
      size = op - PUSH1 + 1
      self.push(size)

    elif op == PUSH0:
      self.stack.append(0)
      self.pc += size

    elif op == POP:
      self.pop()
      elif op == ADD:
      self.add()

    elif op == MUL:
      self.mul()
      elif op == SUB:
      self.sub()

    elif op == DIV:      # handle division instruction
      self.div()
```

Now, we can try to run a bytecode containing a DIV instruction: 0x6003600604 (PUSH1 3 PUSH1 6 DIV). This bytecode pushes 3 and 6 onto the stack and then divides them (6 // 3).

```
code = b"\x60\x03\x60\x06\x04"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [2]
```

## Other arithmetic instructions

1. **SDIV**: Signed integer division instruction. Similar to DIV, this instruction pops two elements from the stack and then divides the first element by the second element with a sign. If the second element (divisor) is 0, the result is 0. Its opcode is 0x05 and the gas cost is 5. Note that negative numbers in the EVM bytecode are in two’s complement form, such as -1 is represented as _\"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff\"_, which plus one equals 0.

```
def sdiv(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  res = a//b % (2**256)  if b!=0 else 0
  self.stack.append(res)
```

2. **MOD**: Modulo instruction. This instruction pops two elements from the stack and pushes the remainder of the first element divided by the second element onto the stack. If the second element (divisor) is 0, the result is 0. Its opcode is 0x06 and the gas cost is 5.

```
def mod(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  res = a % b if b != 0 else 0
  self.stack.append(res)
```

3. **SMOD**: Signed modulo instruction. This instruction pops two elements from the stack and pushes the remainder of the first element divided by the second element onto the stack. If the first element (divisor) is 0, the result is 0. Its opcode is 0x07 and the gas cost is 5.

```
def smod(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()
  res = a % b if b != 0 else 0
  self.stack.append(res)
```

4. **ADDMOD**: Modular addition instruction. This instruction pops three elements from the stack, adds the first two elements, then takes the modulus of the third element and pushes the result onto the stack. If the third element (modulus) is 0, the result is 0. Its opcode is 0x08 and the gas cost is 8.

```
def addmod(self):
  if len(self.stack) < 3:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()
  n = self.stack.pop()

  res = (a + b) % n if n != 0 else 0
  self.stack.append(res)
```

5. **MULMOD**: Modular multiplication instruction. This instruction pops three elements from the stack, multiplies the first two elements, then takes the modulus of the third element and pushes the result onto the stack. If the third element (modulus) is 0, the result is 0. Its opcode is 0x09 and the gas cost is 5.

```
def mulmod(self):
  if len(self.stack) < 3:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()
  n = self.stack.pop()

  res = (a * b) % n if n != 0 else 0
    self.stack.append(res)
```

6. **EXP**: Exponential operation instruction. This instruction pops two elements from the stack, uses the first element as the base and the second element as the exponent, performs the exponential operation, and then pushes the result onto the stack. Its opcode is 0x0A and the gas consumption is 10.

```
def exp(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  res = pow(a, b) % (2**256)
    self.stack.append(res)
```

7. **SIGNEXTEND**: Sign extension is an operation that increases the number of bits in a binary digit while preserving the sign (positive or negative) and value of the number. For example, if a computer uses 8-bit binary to represent the number "0000 1010", and this number needs to be sign-extended to 16 bits, the extended value is "0000 0000 0000 1010". At this time, both the value and the sign are preserved. The SIGNEXTEND instruction pops two elements from the stack, sign-extends the second element by the number of bits determined by the first element, and then pushes the result onto the stack. Its opcode is 0x0B and the gas cost is 5.

```
def signextend(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  b = self.stack.pop()
  x = self.stack.pop()
  if b < 32:      # If b>=32, no expansion is required
    sign_bit = 1 << (8 * b - 1)      # The mask value corresponding to the highest bit (sign bit) of the b byte will be used to detect whether the sign bit of x is 1
    x = x & ((1 << (8 * b)) - 1)     # Perform a mask operation on x, retain the value of the first b+1 bytes of x, and set all the remaining bytes to 0
    if x & sign_bit:                 # Check if the sign bit of x is 1
      x = x | ~((1 << (8 * b)) - 1)  # Set the rest of x to 1
  self.stack.append(x)
```

# Summary

In this chapter, we introduced 11 arithmetic instructions in the EVM and added support for them in the minimalist version of the EVM. Exercise: Write the instruction form corresponding to 0x60036004600209 and give the stack status after running.
