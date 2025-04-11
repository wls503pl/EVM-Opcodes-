# Abstruct

Previously, we introduced PUSH and POP in the stack instructions. In this lecture, we will introduce two other instructions: DUP and SWAP.

## DUP

In EVM, DUP is a series of 16 instructions, from DUP1 to DUP16, with opcodes ranging from 0x80 to 0x8F and gas consumption of 3. These instructions are used to duplicate the specified element on the stack
(according to the sequence number of the instruction) to the top of the stack. For example, DUP1 duplicates the top element of the stack, DUP2 duplicates the second element from the top of the stack, and so on.<br>
We can add support for the DUP instruction in the minimal EVM:

```
DUP1 = 0x80
DUP16 = 0x8F

def dup(self, position):
    if len(self.stack) < position:
        raise Exception('Stack underflow')
    value = self.stack[-position]
    self.stack.append(value)

def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()

        # ... implementation of other instructions ...

        elif DUP1 <= op <= DUP16:      # If it is DUP1-DUP16
            position = op - DUP1 + 1
            self.dup(position)
```

Now, we can try to run a bytecode containing a DUP1 instruction: 0x6001600280 (PUSH1 1 PUSH1 2 DUP1). This bytecode pushes 1 and 2 onto the stack, then performs DUP1 to copy the top element (2), and the stack ends up being [1, 2, 2].

```
# DUP1
code = b"\x60\x01\x60\x02\x80"
evm = EVM(code)
evm.run()
print(evm.stack)  
# output: [1, 2, 2]
```

## SWAP

The SWAP instruction is used to swap the top two elements of the stack. Similar to DUP, SWAP is also a series of 16 instructions from SWAP1 to SWAP16, with opcodes ranging from 0x90 to 0x9F and gas consumption of 3.
SWAP1 swaps the top and second top elements of the stack, SWAP2 swaps the top and third elements, and so on. Let's add support for the SWAP instruction in the minimal EVM:

```
SWAP1 = 0x90
SWAP16 = 0x9F

def swap(self, position):
    if len(self.stack) < position + 1:
        raise Exception('Stack underflow')
    idx1, idx2 = -1, -position - 1
    self.stack[idx1], self.stack[idx2] = self.stack[idx2], self.stack[idx1]

def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()

        # ... implementation of other instructions ...

        elif SWAP1 <= op <= SWAP16:      # If it is DUP1-DUP16
            position = op - SWAP1 + 1
            self.swap(position)
```

Now, we can try to run a bytecode containing a SWAP1 instruction: 0x6001600290 (PUSH1 1 PUSH1 2 SWAP1). This bytecode pushes 1 and 2 onto the stack, then performs SWAP1 to swap the two elements, and the stack ends up being [2, 1].

```
# SWAP1
code = b"\x60\x01\x60\x02\x90"
evm = EVM(code)
evm.run()
print(evm.stack)  
# output: [2, 1]
```

<hr>

# Summary

After this chapter, we have introduced the four most basic stack operations in EVM: PUSH, POP, DUP, and SWAP. Understanding them will help us understand more deeply how EVM works. The minimalist EVM we wrote also supports 111/144 opcodes.
