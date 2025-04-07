# Abstruct

In this chapter, we will introduce two instructions for storage operations in EVM: **SSTORE** and **SLOAD**. And, we will add support for these operations in a minimalist version of EVM written in Python.

## Storage in EVM

EVM storage is different from memory. It is a persistent storage space, and the data stored in the storage can be maintained between transactions. It is part of the EVM state storage and supports reading and writing in 256-bit units.
Since the storage uses key-value pairs to store data, each key and value is 256 bits, so we can use Python's built-in dict to represent the storage:

```
def __init__(self, code):
  self.code = code
  self.pc = 0
  self.stack = []
  self.memory = bytearray()      # Memory initialized to empty
  self.storage = {}              # Storage initialized to empty dictionary
```

Both reading (SLOAD) and writing (SSTORE) storage require gas and are more expensive than memory operations. This design prevents the abuse of storage resources because all storage data needs to be saved on each Ethereum node.

## SSTORE (Store Write)

The SSTORE instruction is used to write a 256-bit (32-byte) value to storage. It pops two elements from the stack, the first element is the storage address (key), and the second element is the stored value (value).
The opcode is 0x55, and the gas consumption is calculated based on the actual data changed (given below).

```
def sstore(self):
    if len(self.stack) < 2:
        raise Exception('Stack underflow')
    key = self.stack.pop()
    value = self.stack.pop()
    self.storage[key] = value
```

We add processing for the SSTORE instruction in the run() function:

```
def run(self):
  while self.pc < len(self.code):
    op = self.next_instruction()

    # ... Processing of other instructions ...

    elif op == SSTORE: # Processing SSTORE instruction
      self.sstore()
```

Now, we can try to run a bytecode containing an SSTORE instruction: 0x6002600055 (PUSH1 2 PUSH1 0 SSTORE). This bytecode pushes 2 and 0 onto the stack, then performs an SSTORE to store 2 into the storage slot with key 0x0.

```
# SSTORE
code = b"\x60\x02\x60\x00\x55"
evm = EVM(code)
evm.run()
print(evm.storage)  
# Output: {0: 2}
```

## SLOAD (Storage Read)

The SLOAD instruction reads a 256-bit (32-byte) value from storage and pushes it onto the stack. It pops an element from the stack, loads the value from the storage slot represented by that element, and pushes it onto the stack.
The opcode is 0x54, and the gas cost is given later.

```
def sload(self):
    if len(self.stack) < 1:
        raise Exception('Stack underflow')
    key = self.stack.pop()
    value = self.storage.get(key, 0)  # If the key does not exist, return 0
    self.stack.append(value)
```

We add processing for the SLOAD instruction in the run() function:

```
elif op == SLOAD: 
    self.sload()
```

Now, we can try to run a bytecode containing a SLOAD instruction: 0x6002600055600054 (PUSH1 2 PUSH1 0 SSTORE PUSH1 0 SLOAD). This bytecode pushes 2 and 0 onto the stack, then performs SSTORE to store 2 at the key 0;
then pushes 0 onto the stack, then performs SLOAD to read the value just written to the 0x0 storage slot.

```
# SLOAD
code = b"\x60\x02\x60\x00\x55\x60\x00\x54"
evm = EVM(code)
evm.run()
print(evm.storage)
# Output: {0: 2}
print(evm.stack)
# Output: [2]
```

## Access set EIP-2929

Access Sets is a new concept proposed by EIP-2929, which helps optimize Gas billing and Ethereum network performance. Access Sets are defined in each external transaction,
and the contract addresses and storage slots accessed by each transaction are tracked and recorded during the transaction.

- **Contract address**: During the execution of a transaction, any address accessed will be added to the access set.
- **Storage slots**: This list contains all the storage slots that a transaction has accessed during its execution.

If an address or storage slot is in the access set, we call it "warm", otherwise it is called "cold". When an address or storage slot is accessed for the first time in a transaction, it changes from "cold" to "warm".
During the execution of a transaction, if an instruction needs to access a "cold" address or storage slot, the Gas consumption of this instruction will be higher.
Access to a "warm" address or storage slot will have a lower Gas consumption because the relevant data has been cached.

## Gas Cost

For **SLOAD** (storage read), if the storage slot being read is "cold" (i.e., this is the first access in a transaction), then the gas consumption of SLOAD is 2100 gas;
if it is "warm" (i.e., it has already been accessed in a transaction), then the gas consumption of SLOAD is 100 gas.<br>
For **SSTORE** (storage write), the gas calculation formula is more complicated and is divided into two parts: gas consumption and gas return.

1. Gas consumption of SSTORE: In simple terms, if the storage slot is cold, it will cost 2100 gas more; if the initial value of the storage slot is 0,
   then changing it to a non-zero value will cost the most gas, which is 22100 gas. The specific calculation formula is as follows:

```
static_gas = 0

if value == current_value
    base_dynamic_gas = 100
else if current_value == original_value
    if original_value == 0
        base_dynamic_gas = 20000
    else
        base_dynamic_gas = 2900
else
    base_dynamic_gas = 100

if key is not warm
    base_dynamic_gas += 2100
```

Where value is the new value to be stored, current_value is the current value of the storage slot, original_value is the original value of the storage slot when the transaction started, and base_dynamic_gas is the gas consumption.

2. Gas refund for SSTORE: When the new value to be stored is not equal to the current value of the storage slot, a gas refund may be triggered. In simple terms, changing the non-zero value of the storage slot to 0 will refund up to 19900 gas.

```
if value != current_value
    if current_value == original_value
        if original_value != 0 and value == 0
            gas_refunds += 4800
    else
        if original_value != 0
            if current_value == 0
                gas_refunds -= 4800
            else if value == 0
                gas_refunds += 4800
        if value == original_value
            if original_value == 0
                    gas_refunds += 19900
            else
                if key is warm
                    gas_refunds += 5000 - 2100 - 100
                else
                    gas_refunds += 4900
```

Where value is the new value to be stored, current_value is the current value of the storage slot, original_value is the original value of the storage slot at the beginning of the transaction, and gas_refunds is the gas refund.

# Summary

In this chapter, we introduced the storage operation instructions (SSTORE and SLOAD) in the EVM and added support for them in the minimalist EVM. These operations allow us to write and read values ​​in the EVM storage, providing a basis for more complex contract logic.
