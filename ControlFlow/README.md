# Abstruct

In this chapter, we will introduce the five instructions used to control flow in the EVM, including **STOP**, **JUMP**, **JUMPI**, **JUMPDEST**, and **PC**. We will add support for these operations in a minimalist version of the EVM written in Python.

## Control Flow in the EVM

The control flow of the EVM is implemented by jump instructions (JUMP, JUMPI, JUMPDEST) controlling the PC(Program Counter) to point to a new instruction location, which allows contracts to perform conditional and loop execution.

## STOP

STOP is the stop instruction of EVM, which stops the execution of the current context and exits successfully. Its opcode is 0x00 and gas consumption is 0.
Setting the STOP opcode to 0x00 has one benefit: when a call is executed to an address without code (EOA) and the EVM attempts to read code data, the system returns a default value of 0, which corresponds to the STOP instruction, and the program stops executing.
Next, let's add processing for the STOP instruction in the _**run()**_ function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    # ... Processing of other instructions ...

    elif op == STOP:      # Processing of STOP instruction
      print('Program has been stopped')
      break               # Stop execution
```

Now, we can try to run a bytecode containing a STOP instruction:

```
# STOP
code = b"\x00"
evm = EVM(code)
evm.run()
# output: Program has been stopped
```

## JUMPDEST

The JUMPDEST instruction marks a valid jump target location, otherwise JUMP and JUMPI cannot be used to jump. Its opcode is 0x5b and the gas consumption is 1.

However, 0x5b is sometimes used as a **PUSH** parameter, so it is necessary to filter the valid **JUMPDEST** instructions in the bytecode before running the code, and use **ValidJumpDest** to store the location of the valid **JUMPDEST** instructions.

```
def findValidJumpDestinations(self):
    pc = 0

    while pc < len(self.code):
        op = self.code[pc]
        if op == JUMPDEST:
            self.validJumpDest[pc] = True
        elif op >= PUSH1 and op <= PUSH32:
            pc += op - PUSH1 + 1
        pc += 1
```

```
def jumpdest(self):
    pass
```

## JUMP

The JUMP instruction is used to unconditionally jump to a new program counter location. It pops an element from the stack and sets it to the new program counter (pc) value. The opcode is 0x56 and the gas cost is 8.

```
def jump(self):
    if len(self.stack) < 1:
        raise Exception('Stack underflow')
    destination = self.stack.pop()
    if destination not in self.validJumpDest:
        raise Exception('Invalid jump destination')
    else:  self.pc = destination
```

We add processing for JUMP and JUMPDEST instructions in the run() function:

```
elif op == JUMP: 
    self.jump()
elif op == JUMPDEST: 
    self.jumpdest()
```

Now, we can try to run a bytecode containing JUMP and JUMPDEST instructions: 0x600456005B (PUSH1 4 JUMP STOP JUMPDEST). This bytecode pushes 4 into the stack, then performs a JUMP to jump to the location of pc = 4, which happens to be the JUMPDEST instruction. The jump is successful and the program is not interrupted by the STOP instruction.

```
# JUMP
code = b"\x60\x04\x56\x00\x5b"
evm = EVM(code)
evm.run()
print(evm.pc)  
# output: 5
```

## JUMPI (conditional jump)

The JUMPI instruction is used for conditional jumps. It pops two elements from the stack and sets the first element (destination) to the new value of pc if the second element (condition) is not 0. The opcode is 0x57 and the gas cost is 10.

```
def jumpi(self):
    if len(self.stack) < 2:
        raise Exception('Stack underflow')
    destination = self.stack.pop()
    condition = self.stack.pop()
    if condition != 0:
        if destination not in self.validJumpDest:
            raise Exception('Invalid jump destination')
        else:  self.pc = destination
```

We add processing for the JUMPI instruction in the run() function:

```
elif op == JUMPI: 
    self.jumpi()
```

Now, we can try to run a bytecode containing JUMPI and JUMPDEST instructions: 0x6001600657005B (PUSH1 01 PUSH1 6 JUMPI STOP JUMPDEST). This bytecode pushes 1 and 6 into the stack, then performs a JUMPI. Since the condition is not 0, execution jumps to the position where pc = 6, which happens to be the JUMPDEST instruction. The jump is successful and the program is not interrupted by the STOP instruction.

```
# JUMPI
code = b"\x60\x01\x60\x06\x57\x00\x5b"
evm = EVM(code)
evm.run()
print(evm.pc)  
# output: 7, The program was not interrupted
```

## PC (Program Counter)

The PC instruction pushes the current value of the program counter (pc) onto the stack. The opcode is 0x58 and the gas cost is 2.

```
def pc(self):
    self.stack.append(self.pc)
```
