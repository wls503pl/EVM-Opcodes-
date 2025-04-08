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
