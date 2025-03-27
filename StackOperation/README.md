# Abstruct

In this Chapter, we introduce the program counter and stack instructions in the EVM, and use Python to implement a simplified version of the EVM that can execute PUSH and POP instructions.

## Program Counter

In the EVM, the program counter (often abbreviated as PC) is a register used to track the location of the currently executed instruction. Each time an instruction (opcode) is executed,
the value of the program counter is automatically increased to point to the next instruction to be executed. However, this process is not always linear. When a jump instruction (JUMP and JUMPI) is executed, the program counter is set to a new value.

Let's create a simple EVM program counter in Python:

```
class EVM:
  # initialize
  def __init__(self, code):
    self.code = code      # initialize bytecode, bytes object
    self.pc = 0           # initialize pc to 0
    self.stack = []       # initialize stack to null

  # acquire current instruction
  def next_instruction(self):
    op = self.code[self.pc]      # acquire current instruction
    self.pc += 1                 # increment
    return op

  def run(self):
    while self.pc < len(self.code):
      op = self.next_instruction()      # acquire current instruction
```

The sample code above is very simple. Its function is to use the program counter to traverse the opcode in the bytecode. In the next part, we will add more functions to it.

```
code = b"\x01\x02\x03"
evm = EVM(code)
evm.run()
```

## Stack Instructions

EVM is based on a stack, which follows the LIFO (last in, first out) principle. The last element put into the stack will be the first element taken out. The PUSH and POP instructions are used to operate the stack.

## PUSH

In EVM, PUSH is a series of operators, a total of 32 (before Ethereum Shanghai upgrade), from PUSH1, PUSH2, to PUSH32, with opcodes ranging from 0x60 to 0x7F. They push a value of 1 to 32 bytes from the bytecode into the stack (each element in the stack is 32 bytes long), and the gas consumption of each instruction is 3.

Take PUSH1 as an example. Its opcode is 0x60, which pushes the next byte in the bytecode into the stack. For example, bytecode 0x6001 means pushing 0x01 into the stack. PUSH2 means pushing the next two bytes in the bytecode into the stack. For example, 0x610101 means pushing 0x0101 into the stack. Other PUSH instructions are similar.

The Ethereum Shanghai upgrade newly added PUSH0, with an opcode of 0x5F (the first digit before 0x60), which is used to push 0 into the stack and consumes 2 gas, which is more gas-efficient than other PUSH instructions.

Next, we use Python to implement PUSH0 to PUSH32. The main logic can be found in the _**push()**_ and _**run()**_ functions:

```
PUSH0 = 0x5F
PUSH1 = 0x60
PUSH32 = 0x7F

class EVM:
  def __init__(self, code):
    self.code = code      # initialize bytecodes, bytes object
    self.pc = 0           # initialize PC to 0
    self.stack = []       # initialize stack to null

  def next_instruction(self):
    op = self.code[self.pc]    # acquire current instruction
    self.pc += 1               # pc add 1 byte
    return op

  def push(self, size):
    data = self.code[self.pc:self.pc + size]      # Get data from code according to size
    value = int.from_bytes(data, 'big')           # Convert bytes to int
    self.stack.append(value)                      # push into the stack
    self.pc += size                               # pc increases by size units

  def run(self):
    while self.pc < len(self.code):
      op = self.next_instruction()

      if PUSH1 <= op <= PUSH32:
        size = op - PUSH1 + 1
        self.push(size)
      elif op == PUSH0:
        self.stack.append(0)
```

The bytecode 0x60016001 (PUSH1 1 PUSH1 1) will push two 1s onto the stack. Let’s execute it:

```
code = b"\x60\x01\x60\x01"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: [1, 1]
```

You can also verify it on evm.codes (note to remove the 0x at the beginning of the bytecode):

<br>

![]()<br>

## POP

In the EVM, the POP instruction (opcode 0x50, gas cost 2) is used to remove the top element of the stack; if the current stack is empty, an exception is thrown.

Next, we add the POP instruction to the previous code. The main logic can be found in the pop() and run() functions:

```
PUSH0 = 0X5F
PUSH1 = 0X60
PUSH32 = 0X7F

class EVM:
  def __init__(self, code):
    self.code = code      # Initialize bytecode, bytes object
    self.pc = 0           # Initialize the program counter to 0
    self.stack = []       # The stack is initially empty

  def next_instruction(self):
    op = self.code[self.pc]      # Get the current instruction
    self.pc += 1                 # Increase by 1
    return op

  def push(self, size):
    data = self.code[self.pc:self.pc + size]      # Get data from code according to size
    value = int.from_bytes(data, 'big')           # Convert bytes to int
    self.stack.append(value)                      # push into the stack
    self.pc += size                               # pc increases by size units

  def pop(self):
    if len(self.stack) == 0:
      raise Exception('Stack underflow')
    return self.stack.pop()                       # Pop Stack

  def run(self):
    while self.pc < len(self.code):
      op = self.next_instruction()

      if PUSH1 <= op <= PUSH32:
        size = op - PUSH1 + 1
        self.push(size)
      elif op == PUSH0:
        self.stack.append(0)
      elif op == POP:
        self.pop()
```

The bytecode 0x6001600150 (PUSH1 1 PUSH1 1 POP) pushes two 1s onto the stack and then pops a 1. Let's execute it:

```
code = b"\x60\x01\x60\x01\x50"
evm = EVM(code)
evm.run()
evm.stack
# output: [1]
```

You can also verify it on evm.codes (note to remove the 0x at the beginning of the bytecode):

<br>

![]()<br>

<hr>

# Summary

In this chapter, we mainly introduced the program counter and stack instructions in the EVM, especially the PUSH and POP instructions. And [referring to evm-from-scratch](https://github.com/w1nt3r-eth/evm-from-scratch), we used Python to implement a simplified version of the EVM that can handle PUSH and POP instructions. In subsequent tutorials, we will continue to explore more opcodes to further improve our EVM implementation.
