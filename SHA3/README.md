# Abstruct

In this Chapter, we will introduce the only built-in cryptographic instruction of EVM - SHA3, which you can use to calculate keccak-256 hash.

## SHA3 ​​Instructions

In EVM, calculating the hash of data is a common operation. Ethereum uses the Keccak algorithm (SHA-3) to calculate the hash of data and provides a dedicated opcode SHA3. The keccak256() function in Solidity is built on it.
The SHA3(offset, size) instruction takes two parameters from the stack, the starting position offset and the length size (in bytes), then it reads the data of size length starting from the starting position offset from the memory,
calculates the Keccak-256 hash of this data, and pushes the result (a 32-byte value) into the stack. Its opcode is 0x20, and the gas consumption is 30 + 6*byte length of the data + extended memory cost.<br>

Python has built-in support for the Keccak (also known as SHA-3) algorithm since version 3.6. You can directly use sha3_256, sha3_512, etc. in the hashlib module.

Next, let's support SHA3 instructions in the minimal EVM:

```
import sha3

SHA3 = 0x20

def sha3(self):
    if len(self.stack) < 2:
        raise Exception('Stack underflow')
    
    offset = self.pop()
    size = self.pop()
    data = self.memory[offset:offset+size]      # Get data from memory
    hash_value = int.from_bytes(sha3.keccak_256(data).digest(), 'big')      # Calculate the hash value
    self.stack.append(hash_value)      # Push the hash value onto the stack

def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()

        # ... implementation of other instructions ...

            elif op == SHA3:      # If it is SHA3
                self.sha3()
```

We can try running a bytecode that contains a SHA3 instruction: 0x5F5F20 (PUSH0 PUSH0 SHA3). This bytecode pushes two 0s onto the stack and then uses the SHA3 instruction to calculate the hash of 0.

```
# SHA3
code = b"\x5F\x5F\x20"
evm = EVM(code)
evm.run()
print(hex(evm.stack[-1]))  # Prints out the keccak256 hash of 0
# output: 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
```

We can verify the result on evm.codes:

![]()

<hr>

# Summary

In this Chapter, we introduced the important operator SHA3 in EVM, which provides us with the function of calculating data hash, which is very important when verifying data or identity.
At present, the minimalist EVM we wrote already supports 112/144 opcodes, and there are not many left!
