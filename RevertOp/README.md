# Abstruct

In this chapter, we will introduce two instructions related to exception handling in EVM: **REVERT** and **INVALID**. When they are triggered, the transaction will be rolled back.

## Transaction Status

We need to track the transaction status success in our minimalist evm. The default is True. It becomes False when the transaction fails and rolls back. Only when success is True will the opcodes continue to be executed, otherwise the transaction ends:

```
class EVM:
    def __init__(self):
        # ... other properties ...
        self.success = True

    def run(self):
        while self.pc < len(self.code) and self.success:
            op = self.next_instruction()
        # ... Command operations ...
```

## REVERT

When a contract runs into an error, or reaches a certain condition that requires termination of execution and return of error information, the REVERT instruction can be used. The REVERT instruction terminates the execution of the transaction, returns an error message,
and all state changes (such as fund transfers, changes in storage values, etc.) will not take effect. It pops two parameters from the stack: the starting position of the error message in memory, mem_offset, and the length of the error message, length.
Its opcode is 0xFD, and the gas consumption is memory expansion consumption.

```
def revert(self):
    if len(self.stack) < 2:
        raise Exception('Stack underflow')
    mem_offset = self.stack.pop()
    length = self.stack.pop()

    # Expand Memory
    if len(self.memory) < mem_offset + length:
        self.memory.extend([0] * (mem_offset + length - len(self.memory)))

    self.returnData = self.memory[mem_offset:mem_offset+length]
    self.success = False
```

## INVALID

INVALID is an instruction used in the EVM to indicate an invalid operation. When the EVM encounters an unrecognizable opcode, or in a situation where an exception is deliberately triggered, it executes the INVALID instruction,
causing all state changes to not take effect and consuming all gas. It ensures that when a contract attempts to perform an undefined operation, it will not do nothing or produce unpredictable behavior, but will safely stop execution,
which is critical to the security of the EVM. Its opcode is 0xFE, and the gas consumption is all the remaining gas.

```
def invalid(self):
    self.success = False
```

## Test

REVERT: We run a bytecode containing a REVERT instruction: 60aa6000526001601ffd (PUSH1 aa PUSH1 0 MSTORE PUSH1 1 PUSH1 1f REVERT). This bytecode stores aa in memory, then uses the REVERT instruction to roll back the transaction and copy aa to returnData.

```
# REVERT
code = b"\x60\xa2\x60\x00\x52\x60\x01\x60\x1f\xfd"
evm = EVM(code)
evm.run()
print(evm.returnData.hex())
# output: a2
```

<hr>

# Summary

In this Chapter, we learned about two instructions related to exception handling in EVM: REVERT and INVALID, and added support for these instructions to the minimalist EVM through code examples. Exception handling is an important part of any program or contract execution,
and these two instructions are the basis of require, error, and assert keywords in Solidity. At present, we have learned 136 out of 144 opcodes (94%)!
