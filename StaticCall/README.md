# Abstruct

In this chapter, we introduce the STATICCALL instruction in EVM, which is similar to the CALL instruction and allows contracts to execute the code of other contracts, but cannot change the state of the contract. 
It is the basis of the pure and view keywords in Solidity.

## STATICCALL instruction

The STATICCALL instruction creates a sub-environment to execute part of the code of other contracts and return data. The return data can be obtained using RETURNDATASIZE and RETURNDATACOPY. If the execution is successful,
1 will be pushed into the stack; otherwise, 0 will be pushed. If the target contract has no code, 1 will still be pushed into the stack (considered successful).

Unlike the CALL instruction, STATICCALL cannot send ETH or change the state of the contract. It does not allow the following instructions to be included in the code executed by the sub-environment:<br>
- CREATE, CREATE2, SELFDESTRUCT
- LOG0 - LOG4
- SSTORE
- CALL (value is not 0)

It pops 6 parameters from the stack, in order:
- **gas**: The amount of gas allocated for this call.
- **to**: The address of the called contract.
- **mem_in_start**: The starting position of the input data (calldata) in memory.
- **mem_in_size**: The length of the input data.
- **mem_out_start**: The starting position of the return data (returnData) in memory.
- **mem_out_size**: The length of the return data.
Its opcode is 0xFA and the gas consumption is: memory expansion cost + address operation cost.

Next, we implement the STATICCALL instruction in the minimalist evm. First, we need to check whether the sub-environment code contains instructions that STATICCALL does not support:

```
def is_state_changing_opcode(self, opcode):  # Check opcodes that static call cannot contain
    state_changing_opcodes = [
        0xF0, # CREATE
        0xF5, # CREATE2
        0xFF, # SELFDESTRUCT
        0xA0, # LOG0
        0xA1, # LOG1
        0xA2, # LOG2
        0xA3, # LOG3
        0xA4, # LOG4
        0x55  # SSTORE
    ]
    return opcode in state_changing_opcodes
```

Then initialize an is_static state in the init() function. When it is true, it means that STATICCALL is executed and unsupported instructions need to be checked:

```
class EVM:
    def __init__(self, code, is_static=False):
        # ... other initializations ...
        self.is_static = is_static

    def run(self):
        while self.pc < len(self.code) and self.success:
            op = self.next_instruction()

            if self.is_static and self.is_state_changing_opcode(op):
                self.success = False
                raise Exception("State changing operation detected during STATICCALL!")
```

In addition, for the CALL of value not equal to 0, we need to make some modifications:

```
def call(self):

    if self.is_static and value != 0:
        self.success = False
        raise Exception("State changing operation detected during STATICCALL!")

    # ... other code ...
```

Finally, we can add the staticcall function:

```
def staticcall(self):
    if len(self.stack) < 6:
        raise Exception('Stack underflow')
        
    gas = self.stack.pop()
    to_addr = self.stack.pop()
    mem_in_start = self.stack.pop()
    mem_in_size = self.stack.pop()
    mem_out_start = self.stack.pop()
    mem_out_size = self.stack.pop()
    
    # Expand Memory
    if len(self.memory) < mem_in_start + mem_in_size:
        self.memory.extend([0] * (mem_in_start + mem_in_size - len(self.memory)))

    # Get input data from memory
    data = self.memory[mem_in_start: mem_in_start + mem_in_size]

    account_target = account_db[hex(to_addr)]
    
    # Use txn to build context
    ctx = Transaction(to=hex(to_addr), 
                        data=data,
                        value=0,
                        caller=self.txn.thisAddr, 
                        origin=self.txn.origin, 
                        thisAddr=hex(to_addr), 
                        gasPrice=self.txn.gasPrice, 
                        gasLimit=self.txn.gasLimit, 
                        )
    
    # Create evm subenvironment
    evm_staticcall = EVM(account_target['code'], ctx, is_static=True)
    # Run the code
    evm_staticcall.run()
    
    # Expand Memory
    if len(self.memory) < mem_out_start + mem_out_size:
        self.memory.extend([0] * (mem_out_start + mem_out_size - len(self.memory)))
    
    self.memory[mem_out_start: mem_out_start + mem_out_size] = evm_staticcall.returnData
    
    if evm_staticcall.success:
        self.stack.append(1)  
    else:
        self.stack.append(0)
```

## Test

In the test, we will use the first address (starting at 0x9bbf) to call the second address (starting at 0x1000), run the above code (PUSH1 0x42 PUSH1 0 MSTORE PUSH1 1 PUSH1 31 RETURN), and if successful, it will return 0x42.
The test bytecode is 6001601f5f5f731000000000000000000000000000000000000000000c425ffA5f51 (PUSH1 1 PUSH1 31 PUSH0 PUSH0 PUSH20 100000000000000000000000000000000000000000c42 PUSH0 STATICCALL PUSH0 MLOAD),
which calls the code at the second address and then pushes the return value 0x42 from memory onto the stack.

```
# Staticcall
code = b"\x60\x01\x60\x1f\x5f\x5f\x73\x10\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x0c\x42\x5f\xfA\x5f\x51"
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-2]))
# output: 0x1 (success)
print(hex(evm.stack[-1]))
# output: 0x42
```

<hr>

# Summary

In this chapter, we explored the STATICCALL instruction, which provides a safe way to execute code from other contracts without modifying the contract state, and is the basis for the pure and view keywords in Solidity.
Currently, we have learned 140 out of 144 opcodes (97%)!
