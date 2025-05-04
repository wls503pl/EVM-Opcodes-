# Abstruct

In this chapter, we will introduce the CALL instruction in EVM. The CALL instruction can be regarded as the core of Ethereum. It allows contracts to interact with each other, making the contracts on the blockchain no longer isolated.

## CALL instruction

The CALL instruction creates a sub-environment to execute part of the code of other contracts, send ETH, and return data. The return data can be obtained using RETURNDATASIZE and RETURNDATACOPY. If the execution is successful, 1 will be pushed into the stack;
otherwise, 0 will be pushed. If the target contract has no code, 1 will still be pushed into the stack (considered successful). If the account ETH balance is less than the amount of ETH to be sent, the call fails, but the current transaction will not be rolled back.

It pops 7 parameters from the stack, in order:<br>

- **gas**: The amount of gas allocated for this call.
- **to**: The address of the called contract.
- **value**: The amount of ether to send, in wei.
- **mem_in_start**: The starting position of the input data (calldata) in memory.
- **mem_in_size**: The length of the input data.
- **mem_out_start**: The starting position of the return data (returnData) in the memory.
- **mem_out_size**: the length of the returned data

Its opcode is 0xF1, and the gas consumption is relatively complex, including costs such as memory expansion and code execution.

Below, we support the CALL instruction in the minimalist EVM. Since the CALL instruction is relatively complex, we have made some simplifications, mainly including the following steps: read calldata, update ETH balance, create an evm subenvironment according to the target address code, execute the evm subenvironment code, and read the return value.

```
def call(self):
  if len(self.stack) < 7:
    raise Exception('Stack underflow')

  gas = self.stack.pop()
  to_addr = self.stack.pop()
  value = self.stack.pop()
  mem_in_start = self.stack.pop()
  mem_in_size = self.stack.pop()
  mem_out_start = self.stack.pop()
  mem_out_size = self.stack.pop()

  # Expand Memory
  if len(self.memory) < mem_in_start + mem_in_size:
    self.memory.extend([0] * (mem_in_start + mem_in_size - len(self.memory)))

  # Get input data from memory
  data = self.memory[mem_in_start: mem_in_start + mem_in_size]

  account_source = account_db[self.txn.caller]
  account_target = account_db[hex(to_addr)]

  # Check the balance of caller
  if account_source['balance'] < value:
        self.success = False
        print("Insufficient balance for the transaction!")
        self.stack.append(0) 
        return

  # Update balance
  account_source['balance'] -= value
  account_target['balance'] += value

  # Use txn to build context
  ctx = Transaction(to=hex(to_addr), 
                        data=data,
                        value=value,
                        caller=self.txn.thisAddr, 
                        origin=self.txn.origin, 
                        thisAddr=hex(to_addr), 
                        gasPrice=self.txn.gasPrice, 
                        gasLimit=self.txn.gasLimit, 
                        )

  # Create an evm subenvironment
  evm_call = EVM(account_target['code'], ctx)
  evm_call.run()

  # Expand Memory
  if len(self.memory) < mem_out_start + mem_out_size:
        self.memory.extend([0] * (mem_out_start + mem_out_size - len(self.memory)))

  self.memory[mem_out_start: mem_out_start + mem_out_size] = evm_call.returnData

  if evm_call.success:
    self.stack.append(1)  
  else:
    self.stack.append(0)
```

## Test

Ethereum account status for testing:

```
account_db = { 
  '0x9bbfed6889322e016e0a02ee459d306fc19545d8': { 
    'balance': 100, #wei 
    'nonce': 1, 
    'storage': {}, 
    'code': b'' 
  }, 
  '0x1000000000000000000000000000000000000c42': { 
    'balance': 0, #wei 
    'nonce': 0, 
    'storage': {}, 
    'code': b'\x60\x42\x60\x00\x52\x60\x01\x60\x1f\xf3' # PUSH1 0x42 PUSH1 0 MSTORE PUSH1 1 PUSH1 31 RETURN
  },

  # ... Other account data ...
}
```

In the test, we will use the first address (starting at 0x9bbf) to call the second address (starting at 0x1000), run the above code (PUSH1 0x42 PUSH1 0 MSTORE PUSH1 1 PUSH1 31 RETURN), and if successful,
it will return 0x42.<br>
The test bytecode is 6001601f5f5f60017310000000000000000000000000000000000000000000c425ff15f51 (PUSH1 1 PUSH1 31 PUSH0 PUSH0 PUSH1 1 PUSH20 100000000000000000000000000000000000000000c42 PUSH0 CALL PUSH0 MLOAD), which calls the code at the second address, sends 1 wei of Ethereum, and then pushes the return value 0x42 from memory onto the stack.

```
# Call
code = b"\x60\x01\x60\x1f\x5f\x5f\x60\x01\x73\x10\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x0c\x42\x5f\xf1\x5f\x51"
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-2]))
# output: 0x1 (success)
print(hex(evm.stack[-1]))
# output: 0x42
```

<hr>

# Summary

In this lesson, we discussed the CALL instruction, which allows contracts on the EVM to call other contracts to achieve more complex functions. I hope this lesson is helpful to you! At present, we have learned 137 (95%)
of the 144 opcodes!
