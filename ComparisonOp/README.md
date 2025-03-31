# Abstruct

In this chapter, we will introduce the six instructions for comparison operations in the EVM, including LT (less than), GT (greater than), and EQ (equal). And, we will add support for them in the minimalist version of the EVM written in Python.

## LT (less than)

The LT instruction pops two elements from the stack and compares whether the second element is less than the first element. If it is, it pushes 0 to the stack, otherwise it pushes 1 to the stack.
If the stack contains less than two elements, an exception is thrown. The opcode of this instruction is 0x10 and the gas cost is 3. We can add an implementation of the LT instruction to our minimalist EVM:

```
def lt(self):
  if len(self.stack) < 2:
    raise Exception('Stack underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(int(b < a))      # Note the comparison order here
```

We add processing for the LT instruction in the run() function:

```
def run(self):
  while self.pc < len(self.code)
    op = self.next_instruction()

    # ... Processing of other instructions ...
    elif op == LT:
      self.lt()
```

Now, we can try to run a bytecode containing a LT instruction: 0x6002600310 (PUSH1 2 PUSH1 3 LT). This bytecode pushes 2 and 3 into the stack, and then compares whether 2 is less than 3.

```
code = b"\x60\x02\x60\x03\x10"
evm = EVM(code)
evm.run()
print(evm.stack)
# output[0]
```

## GT(greater than)

The GT instruction is very similar to the LT instruction, but it compares whether the second element is greater than the first element. If it is, 0 is pushed onto the stack, otherwise 1 is pushed onto the stack.
If the stack has less than two elements, an exception is thrown. The opcode for this instruction is 0x10 and the gas cost is 3. The opcode is 0x11 and the gas cost is 3.
We add the implementation of GT instructions to the minimal EVM:

```
def gt(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(int(b > a))      # Note the comparison order here
```

We add processing for GT instructions in the run() function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    # ... processing of other instructions ...
    elif op == GT:                   # Process GT instructions
      self.gt()
```

Now, we can run a bytecode that contains a GT instruction: 0x6002600311 (PUSH1 2 PUSH1 3 GT). This bytecode pushes 2 and 3 onto the stack, and then compares whether 2 is greater than 3.

```
code = b"\x60\x02\x60\x03\x11"
evm = EVM(code)
evm.run()
print(evm.stack)
# output:[1]
```

## EQ (equal)

The EQ instruction pops two elements from the stack and pushes 1 to the stack if the two elements are equal, otherwise pushes 0 to the stack. The opcode of this instruction is 0x14 and the gas cost is 3.
We add the implementation of the EQ instruction to the minimal EVM:

```
def eq(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(int(a == b))
```

We add processing for the EQ instruction in the run() function:

```
elif op == EQ:
  self.eq()
```

Now, we can run a bytecode that contains an EQ instruction: 0x6002600314 (PUSH1 2 PUSH1 3 EQ). This bytecode pushes 2 and 3 onto the stack and then compares them to see if they are equal.

```
code = b"\x60\x02\x60\x03\x14"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [0]
```

## ISZERO (is it zero)

The ISZERO instruction pops an element from the stack and pushes 1 to the stack if the element is 0, otherwise it pushes 0 to the stack. The opcode of this instruction is 0x15 and the gas cost is 3.
We add the implementation of the ISZERO instruction to the minimal EVM:

```
def iszero(self):
  if len(self.stack) < 1:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  self.stack.append(int(a == 0))
```

We add the processing of the ISZERO instruction in the run() function:

```
elif op == ISZERO:
  self.iszero()
```

Now, we can run a bytecode that contains an ISZERO instruction: 0x600015 (PUSH1 0 ISZERO). This bytecode pushes 0 onto the stack and then checks if it is 0.

```
code = b"\x60\x00\x15"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [1]
```

## Other comparison instructions

1. SLT (Signed Less Than): This instruction pops two elements from the stack and compares whether the second element is less than the first element, returning the result as a signed integer.
   If the second element is less than the first element, 0 is pushed into the stack, otherwise 1 is pushed into the stack. Its opcode is 0x12 and the gas cost is 3.

```
def slt(self):
  if len(self.stack) < 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(int(b < a))      # The values ​​in the minimalist evm stack are already stored as signed integers, so they are implemented the same as lt
```

2. SGT (Signed Greater Than): This instruction pops two elements from the stack and compares whether the second element is greater than the first element, returning the result as a signed integer.
   If the second element is greater than the first element, 0 is pushed onto the stack, otherwise 1 is pushed onto the stack. Its opcode is 0x13 and the gas cost is 3.

```
def slt(self):
  if len(self.stack) > 2:
    raise Exception('Stack Underflow')

  a = self.stack.pop()
  b = self.stack.pop()

  self.stack.append(int(b > a))      # The values ​​in the minimalist evm stack are already stored as signed integers, so they are implemented the same as gt
```

# Summary

In this chapter, we introduced 6 comparison instructions in EVM and added support for them in the minimalist version of EVM. After-class exercises: Write the instruction form corresponding to 0x6003600414 and give the stack status after running.
