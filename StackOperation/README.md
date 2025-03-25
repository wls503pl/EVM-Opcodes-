# Abstruct

In this Chapter, we introduce the program counter and stack instructions in the EVM, and use Python to implement a simplified version of the EVM that can execute PUSH and POP instructions.

## Program Counter

In the EVM, the program counter (often abbreviated as PC) is a register used to track the location of the currently executed instruction. Each time an instruction (opcode) is executed,
the value of the program counter is automatically increased to point to the next instruction to be executed. However, this process is not always linear. When a jump instruction (JUMP and JUMPI) is executed, the program counter is set to a new value.
