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

