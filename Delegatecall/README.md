# Abstruct

In this chapter, we introduce the DELEGATECALL instruction in the EVM and the deprecated CALLCODE instruction. They are similar to the CALL instruction, but the calling context is different.

## DELEGATECALL

The DELEGATECALL instruction has many similarities to CALL, but the key difference is the context of the call, and it is widely used in proxy contracts and upgradeable contracts. It is designed to allow a contract to borrow code from other contracts,
but the code is executed in the context of the original contract. This allows a piece of code to be reused by multiple contracts without redeployment. When using DELEGATECALL, msg.sender and msg.value remain unchanged,
and the modified storage variables are also those of the original contract.

It pops 6 arguments from the stack, and unlike CALL, it does not include value, since ETH will not be sent:
- **gas**: The amount of gas allocated for this call.
- **to**: The address of the called contract.
- **mem_in_start**: The starting position of the input data (calldata) in memory.
- **mem_in_size**: The length of the input data.
- **mem_out_start**: The starting position of the return data (returnData) in the memory.
- **mem_out_size**: The length of the returned data.

```
def delegatecall(self): 
  if len(self.stack) < 6: 
    raise Exception('Stack underflow') 

  gas = self.stack.pop() 
  to_addr = self.stack.pop() 
  mem_in_start = self.stack.pop() 
  mem_in_size = self.stack.pop() 
  mem_out_start = self.stack.pop() 
  mem_out_size = self.stack.pop() 

  #Expand memory 
  if len(self.memory) < mem_in_start + mem_in_size: 
    self.memory.extend([0] * (mem_in_start + mem_in_size - len(self.memory))) 

  # Get input data from memory 
  data = self.memory[mem_in_start: mem_in_start + mem_in_size] 

  account_target = account_db[hex(to_addr)]

  # Create evm sub-environment. Note that the context here is the original calling contract, not the target contract
  evm_delegate = EVM(account_target['code'], self.txn)
  evm_delegate.storage = self.storage
  # Run code
  evm_delegate.run()

  # Expand memory
  if len(self.memory) < mem_out_start + mem_out_size:
    self.memory.extend([0] * (mem_out_start + mem_out_size - len(self.memory)))

    self.memory[mem_out_start: mem_out_start + mem_out_size] = evm_delegate.returnData

  if evm_delegate.success:
    self.stack.append(1)
  else: 
    self.stack.append(0) 
  print("Delegatecall execution failed!")
```

There are two key points to note:
1. DELEGATECALL does not change msg.sender and msg.value.
2. The storage changed by DELEGATECALL is the storage of the original contract.
3. Unlike CALL, DELEGATECALL does not pass ETH value, so there is one less value parameter.

# CALLCODE

CALLCODE is very similar to DELEGATECALL, but when modifying state variables, it changes the contract state of the caller instead of the callee. For this reason, CALLCODE may cause unexpected behavior in some cases and is currently considered deprecated.
It is recommended that you use DELEGATECALL instead of CALLCODE. We consider CALLCODE deprecated according to EIP-2488: each call pushes 0 on the stack (considered a call failure).

```
def callcode(self):
    self.stack.append(0)  
    print("Callcode not support!")
```

# Test

In the test, we will use the first address (starting at 0x9bbf) to call the second address (starting at 0x1000), run the above code (PUSH1 0x42 PUSH1 0 MSTORE PUSH1 1 PUSH1 31 RETURN), and if successful, it will return 0x42.
The test bytecode is 6001601f5f5f731000000000000000000000000000000000000000000c425ff45f51 (PUSH1 1 PUSH1 31 PUSH0 PUSH0 PUSH20 100000000000000000000000000000000000000000c42 PUSH0 DELEGATECALL PUSH0 MLOAD),
which calls the code at the second address and then pushes the return value 0x42 from memory onto the stack.

```
# Delegatecall
code = b"\x60\x01\x60\x1f\x5f\x5f\x73\x10\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x0c\x42\x5f\xf4\x5f\x51"
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-2]))
# output: 0x1 (success)
print(hex(evm.stack[-1]))
# output: 0x42
```

<hr>

# Summary

In this chapter, we explored the DELEGATECALL instruction, which allows contracts on the EVM to call other contracts without changing the context, increasing the reusability of the code. It is widely used in proxy contracts and upgradeable contracts.
In addition, we also introduced the CALLCODE instruction that has been considered deprecated. At present, we have learned 139 (96%) of the 144 opcodes!
