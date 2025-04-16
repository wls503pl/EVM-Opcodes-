# Abstruct

In this Chapter, we will explore 4 instructions in EVM related to the transaction context, including ADDRESS, ORIGIN, CALLER, etc. We can use these instructions to access information about the current transaction or caller.

## The basic structure of a transaction

![txStructure](https://github.com/wls503pl/EVM-Opcodes-/blob/main/TransactionOp/img/txStructure.png)

Before we dive into these instructions, let's first understand the basic structure of an Ethereum transaction. Each Ethereum transaction has the following properties:

- **nonce**: A number associated with a sender's account that indicates the number of transactions that the account has sent.
- **gasPrice**: The unit gas price that the transaction sender is willing to pay.
- **gasLimit**: The maximum amount of gas allocated by the transaction sender for this transaction.
- **to**: The recipient address of the transaction. When the transaction is created for a contract, this field is empty.
- **value**: The amount to send in wei.
- **data**: the accompanying data, usually the input data (calldata) of the contract call or the initialization code (initcode) of the new contract.
- **v**, **r**, **s**: three values ​​related to the transaction signature.

  On this basis, we can add a transaction class in the minimalist EVM. In addition to the above information, we also include some transaction context information, including the current caller, the original sender origin (signer),
  and the execution contract address, thisAddr (address(this) in Solidity):

  ```
  class Transaction:
    def __init__(self, to = '', value = 0, data = '', caller='0x00', origin='0x00', thisAddr='0x00', gasPrice=1, gasLimit=21000, nonce=0, v=0, r=0, s=0):
        self.nonce = nonce
        self.gasPrice = gasPrice
        self.gasLimit = gasLimit
        self.to = to
        self.value = value
        self.data = data
        self.caller = caller
        self.origin = origin
        self.thisAddr = thisAddr
        self.v = v
        self.r = r
        self.s = s
  ```

  When initializing the evm object, you need to pass in the Transaction object:

  ```
  class EVM:
    def __init__(self, code, txn = None):

      # Initialize other variables...

      self.txn = txn

  # Example
  code = b"\x73\x9b\xbf\xed\x68\x89\x32\x2e\x01\x6e\x0a\x02\xee\x45\x9d\x30\x6f\xc1\x95\x45\xd8\x31"
  txn = Transaction(to='0x9bbfed6889322e016e0a02ee459d306fc19545d8', value=10, data='', caller='0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', origin='0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  vm = EVM(code, txn)
  ```

# Trading Instructions

1. ADDRESS

- Opcode: 0x30
- Gas consumption: 2
- Function: Push the address of the currently executed contract into the stack.
- Usage scenario: Used when the contract needs to know its own address.

```
def address(self):
    self.stack.append(self.txn.thisAddr)
```

2. ORIGIN

- Opcode: 0x32
- Gas consumption: 2
- Function: Push the original sender (signer) address of the transaction into the stack.
- Usage scenario: Distinguish between the contract caller and the transaction initiator.

```
def origin(self):
    self.stack.append(self.txn.origin)
```

3. CALLER

- Opcode: 0x32
- Gas consumption: 2
- Function: Push the original sender (signer) address of the transaction into the stack.
- Usage scenario: Distinguish between the contract caller and the transaction initiator

```
def caller(self):
    self.stack.append(self.txn.caller)
```

4. CALLVALUE

- Opcode: 0x34
- Gas cost: 2
- Function: Push the amount of ether (in wei) sent to the contract onto the stack.
- Use case: Used when the contract needs to know how much ether was sent.

```
def callvalue(self):
    self.stack.append(self.txn.value)
```

5. CALLDATALOAD

- Opcode: 0x35
- Gas consumption: 3
- Function: Load data from the data field of a transaction or contract call. It pops the offset of calldata from the stack, then reads 32 bytes of data from the offset position of calldata and pushes it into the stack. If calldata has less than 32 bytes left, it is padded with 0.
- Use scenario: Read incoming data.

```
def calldataload(self):
    if len(self.stack) < 1:
        raise Exception('Stack underflow')
    offset = self.stack.pop()
    # Convert from character form to bytes array
    calldata_bytes = bytes.fromhex(self.txn.data[2:]) # Assume it starts with '0x'
    data = bytearray(32)
    # Copy calldata
    for i in range(32):
        if offset + i < len(calldata_bytes):
            data[i] = calldata_bytes[offset + i]
    self.stack.append(int.from_bytes(data, 'big'))
```

6. CALLDATASIZE

- Opcode: 0x36
- Gas consumption: 2
- Function: Get the byte length of the data field of a transaction or contract call and push it onto the stack.
- Use scenario: Check the size before reading data.

```
def calldatasize(self):
    # Assuming calldata is a hex string with a '0x' prefix
    size = (len(self.transaction.data) - 2) // 2
    self.stack.append(size)
```

7. CALLDATACOPY

- Opcode: 0x37
- Gas consumption: 3 + 3 * data length + memory expansion cost
- Function: copy the data in data to memory. It pops 3 parameters (mem_offset, calldata_offset, length) from the stack, corresponding to the offset to write to memory, and the offset and length to read from calldata.
- Usage scenario: copy input data to memory.

```
def calldatacopy(self):
    # Make sure there is enough data in the stack
    if len(self.stack) < 3:
        raise Exception('Stack underflow')
    mem_offset = self.stack.pop()
    calldata_offset = self.stack.pop()
    length = self.stack.pop()
        
    # Expand Memory
    if len(self.memory) < mem_offset + length:
        self.memory.extend([0] * (mem_offset + length - len(self.memory)))

    # Convert from character form to bytes array.
    calldata_bytes = bytes.fromhex(self.txn.data[2:])  # Assuming it's prefixed with '0x'

    # Copy calldata to memory
    for i in range(length):
        if calldata_offset + i < len(calldata_bytes):
            self.memory[mem_offset + i] = calldata_bytes[calldata_offset + i]
```

8. CODESIZE

- Opcode: 0x38
- Gas consumption: 2
- Function: Get the byte length of the current contract code and push it into the stack.
- Usage scenario: Used when the contract needs to access its own bytecode.

```
def codesize(self):
    addr = self.txn.thisAddr
    self.stack.append(len(account_db.get(addr, {}).get('code', b'')))
```

9. CODECOPY

- Opcode: 0x39
- Gas consumption: 3 + 3 * data length + memory expansion cost
- Function: Copies the contract's code to the EVM's memory. It pops three parameters from the stack: the start offset of the target memory (mem_offset), the start offset of the code (code_offset), and the length to be copied (length).
- Use scenario: Used when a contract needs to read part of its own bytecode.

```
def codecopy(self):
    if len(self.stack) < 3:
        raise Exception('Stack underflow')

    mem_offset = self.stack.pop()
    code_offset = self.stack.pop()
    length = self.stack.pop()

    # Get the code of the current address
    addr = self.txn.thisAddr
    code = account_db.get(addr, {}).get('code', b'')

    # Expand Memory
    if len(self.memory) < mem_offset + length:
        self.memory.extend([0] * (mem_offset + length - len(self.memory)))

    # Copy the code to memory
    for i in range(length):
        if code_offset + i < len(code):
            self.memory[mem_offset + i] = code[code_offset + i]
```

10. GASPRICE

- Operation code: 0x3A
- Gas consumption: 2
- Function: Get the gas price of the transaction and push it into the stack.
- Usage scenario: Used when the contract needs to know the gas price of the current transaction.

```
def gasprice(self):
    self.stack.append(self.txn.gasPrice)
```

<hr>

# Summary

In this chapter, we have introduced in detail the 10 instructions in the EVM related to transactions. These instructions provide smart contracts with the ability to interact with their environment, enabling them to access information such as callers, calldata, and code. Currently, we have learned 126 out of 144 opcodes!
