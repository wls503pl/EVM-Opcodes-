# Abstruct

In this Chapter, we will explore four instructions related to accounts in EVM, including BALANCE, EXTCODESIZE, EXTCODECOPY, and EXTCODEHASH. We can use these instructions to obtain information about Ethereum accounts.

## Ethereum account structure

There are two types of accounts on Ethereum: Externally Owned Accounts (EOA) and Contract Accounts. EOAs are the user's representatives on the Ethereum network. They can own ETH, send transactions, and interact with contracts.
Contract accounts are entities that store and execute smart contract codes. They can also own and send ETH, but cannot actively initiate transactions.
![]()

The account structure on Ethereum is very simple. You can think of it as a mapping from address to account status. The account address is 20 bytes (160 bits) of data, which can be represented by 40 bits of hexadecimal,
such as 0x9bbfed6889322e016e0a02ee459d306fc19545d8. The account status has four attributes:<br>

- **Balance**: This is the amount of ETH held by the account, expressed in Wei (1 ETH = 10^18 Wei).
- **Nonce**: For external accounts (EOA), this is the number of transactions sent by the acc
-
- ount. For contract accounts, it is the number of contracts created by the account.
- **Storage**: Each contract account has storage space associated with it, which contains the values ​​of state variables.
- **Code**: The bytecode of the contract account.

That is to say, only the contract account has Storage and Code, but EOA does not.
In order to make the minimalist EVM support account-related instructions, we use dict to make a simple account database:

```
account_db = {
  '0x9bbfed6889322e016e0a02ee459d306fc19545d8': {
    'balance': 100, # wei
    'nonce': 1,
    'storage': {},
    'code': b'\x60\x00\x60\x00' # Sample bytecode (PUSH1 0x00 PUSH1 0x00)
  },
  # ... Other account data ...
}
```

Next, we will introduce account-related commands.

## BALANCE

The BALANCE instruction is used to return the balance of an account. It pops an address from the stack, then queries the balance of that address and pushes it onto the stack. Its opcode is 0x31, and the gas is 2600 (cold address) or 100 (warm address).

```
def balance(self):
  if len(self.stack) < 1:
    raise Exception('Stack underflow')
  addr_int = self.stack.pop()
  # Convert the int in the stack to bytes, and then to a hexadecimal string for querying in the account database
  addr_str = '0x' + addr_int.to_bytes(20, byteorder='big').hex()
  self.stack.append(account_db.get(addr_str, {}).get('balance', 0))
```

We can try running a bytecode that contains a BALANCE instruction: 739bbfed6889322e016e0a02ee459d306fc19545d831 (PUSH20 9bbfed6889322e016e0a02ee459d306fc19545d8 BALANCE). This bytecode uses PUSH20 to push an address onto the stack,
and then uses the BALANCE instruction to query the balance of that address.

```
# BALANCE
code = b"\x73\x9b\xbf\xed\x68\x89\x32\x2e\x01\x6e\x0a\x02\xee\x45\x9d\x30\x6f\xc1\x95\x45\xd8\x31"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: 100
```

## EXTCODESIZE

The EXTCODESIZE instruction is used to return the code length (in bytes) of an account. It pops an address from the stack, then queries the code length of the address and pushes it onto the stack. If the account does not exist or has no code, it returns 0.
Its opcode is 0x3B, and its gas is 2600 (cold address) or 100 (warm address).

```
def extcodesize(self):
  if len(self.stack) < 1:
    raise Exception('Stack underflow')
  addr_int = self.stack.pop()
  # Convert the int in the stack to bytes, and then to a hexadecimal string for querying in the account database
  addr_str = '0x' + addr_int.to_bytes(20, byteorder='big').hex()
  self.stack.append(len(account_db.get(addr_str, {}).get('code', b'')))
```

We can try running a bytecode that contains an EXTCODESIZE instruction: 739bbfed6889322e016e0a02ee459d306fc19545d83B (PUSH20 9bbfed6889322e016e0a02ee459d306fc19545d8 EXTCODESIZE). This bytecode uses PUSH20 to push an address onto the stack,
and then uses the EXTCODESIZE instruction to query the code length at that address.

```
# EXTCODESIZE
code = b"\x73\x9b\xbf\xed\x68\x89\x32\x2e\x01\x6e\x0a\x02\xee\x45\x9d\x30\x6f\xc1\x95\x45\xd8\x3B"
evm = EVM(code)
evm.run()
print(evm.stack)
# output: 4
```

## EXTCODECOPY

The EXTCODECOPY instruction is used to copy part of the code of an account to the memory of the EVM. It pops 4 parameters (addr, mem_offset, code_offset, length) from the stack, corresponding to the address to be queried, the offset to write to the memory,
and the offset and length of the code to read. Its opcode is 0x3C, and the gas is determined by the length of the code to read, the memory expansion cost, and whether the address is cold.

```
def extcodecopy(self):
  # Make sure there is enough data in the stack
  if len(self.stack) < 4:
    raise Exception('Stack underflow')
  addr = self.stack.pop()
  mem_offset = self.stack.pop()
  code_offset = self.stack.pop()
  length = self.stack.pop()

  code = account_db.get(addr, {}).get('code', b'')[code_offset:code_offset+length]

  while len(self.memory) < mem_offset + length:
    self.memory.append(0)

  self.memory[mem_offset:mem_offset+length] = code
```

We can try to run a bytecode containing the EXTCODECOPY instruction: 60045F5F739bbfed6889322e016e0a02ee459d306fc19545d83C (PUSH1 4 PUSH0 PUSH0 PUSH20 9bbfed6889322e016e0a02ee459d306fc19545d8 EXTCODECOPY). This bytecode pushes 4 (length), 0 (code_offset), 0 (mem_offset),
and the address (addr) into the stack, and then uses the EXTCODECOPY instruction to copy the code to memory.

```
# EXTCODECOPY
code = b"\x60\x04\x5F\x5F\x73\x9b\xbf\xed\x68\x89\x32\x2e\x01\x6e\x0a\x02\xee\x45\x9d\x30\x6f\xc1\x95\x45\xd8\x3C"
evm = EVM(code)
evm.run()
print(evm.memory.hex())
# output: 60006000
```

## EXTCODEHASH

The EXTCODEHASH instruction returns the Keccak256 hash of an account's code. It pops an address from the stack, then looks up the hash of the address' code and pushes it onto the stack. Its opcode is 0x3F, and the gas is 2600 (cold address) or 100 (warm address).br>
Method 1: Use hashlib from the standard library (recommended, lightweight)

```
import hashlib

def extcodehash(self):
    if len(self.stack) < 1:
        raise Exception('Stack underflow')
    addr_int = self.stack.pop()
    addr_str = '0x' + addr_int.to_bytes(20, byteorder='big').hex()
    code = account_db.get(addr_str, {}).get('code', b'')
    
    # Use keccak256 from hashlib (note the name is sha3_256)
    code_hash = int.from_bytes(hashlib.sha3_256(code).digest(), 'big')
    self.stack.append(code_hash)

```

Method2: Use web3's built-in Keccak function (fully compatible with Ethereum)<br>
If you already have web3.py installed, this is the most accurate and direct way:

```
from web3 import Web3

def extcodehash(self):
    if len(self.stack) < 1:
        raise Exception('Stack underflow')
    addr_int = self.stack.pop()
    addr_str = '0x' + addr_int.to_bytes(20, byteorder='big').hex()
    code = account_db.get(addr_str, {}).get('code', b'')
    
    code_hash = int.from_bytes(Web3.keccak(code), 'big')
    self.stack.append(code_hash)
```

We can try running a bytecode that contains an EXTCODEHASH instruction: 739bbfed6889322e016e0a02ee459d306fc19545d83F (PUSH20 9bbfed6889322e016e0a02ee459d306fc19545d8 EXTCODEHASH).
This bytecode uses PUSH20 to push an address onto the stack, and then uses the EXTCODEHASH instruction to query the code hash of that address.

```
# EXTCODEHASH
code = b"\x73\x9b\xbf\xed\x68\x89\x32\x2e\x01\x6e\x0a\x02\xee\x45\x9d\x30\x6f\xc1\x95\x45\xd8\x3F"
evm = EVM(code)
evm.run()
print(hex(evm.stack[-1]))
# output: 0x5e3ce470a8506d55e59815db7232a08774174ae0c7fdb2fbc81a49e4e242b0d6
```

<hr>

# Summary

In this chapter, we briefly introduced the Ethereum account structure and learned a series of instructions related to accounts. These instructions allow contracts to interact with other accounts on Ethereum and obtain relevant information,
providing a basis for interaction between contracts. So far, we have learned 116 out of 144 opcodes!
