# Abstruct

In this chapter, we introduce the SELFDESTRUCT instruction in EVM, which can make the contract self-destruct. This instruction may be deprecated in the future.

## Basic Concept

The SELFDESTRUCT instruction in the EVM allows the contract to destroy itself and send the ETH balance in the account to the specified address. Some special features of this instruction:
1. When using the SELFDESTRUCT instruction, the current contract will be marked as pending destruction. However, the actual destruction operation will be performed after the entire transaction is completed.
2. The contract's ETH balance will be sent to the specified address, and this process is guaranteed to be successful.
3. If the specified address is a contract, the code of the contract will not be executed, that is, the fallback method of the target address will not be executed like a normal ETH transfer.
4. If the specified address does not exist, a new account will be created for it and the ETH will be stored there.
5. Once a contract is destroyed, its code and data are permanently deleted from the chain and cannot be recovered. Destroying a contract may affect other contracts or services that interact with it.

The workflow of the SELFDESTRUCT instruction is as follows:
1. Pop the specified address to receive ETH from the stack.
2. Transfer the balance of the current contract to the specified address.
3. Destroy the contract.

Next, we implement the SELFDESTRUCT instruction in the minimalist EVM:

```
def selfdestruct(self):
  if len(self.stack) < 1:
    raise Exception('Stack underflow')

  # Pop the specified address for receiving ETH
  raw_recipient = self.stack.pop()
  recipient = '0x' + format(raw_recipient, '040x') # Convert to 40 hexadecimal characters with a 0x prefix

  # If the address does not exist, create it
  if recipient not in account_db:
  account_db[recipient] = {'balance': 0, 'nonce': 0, 'storage': {}, 'code': bytearray(b'')}

  # Transfer the balance of the contract to the recipient account
  account_db[recipient]['balance'] += account_db[self.txn.thisAddr]['balance']

  # Delete the contract from the database
  del account_db[self.txn.thisAddr]
```

## Test

```
# Define Txn
addr = '0x1000000000000000000000000000000000000c42'
txn = Transaction(to=None, value=10, 
                  caller=addr, origin=addr, thisAddr=addr)

# SELFDESTRUCT 
# delete account: 0x1000000000000000000000000000000000000c42
print("Before Self-destruct: ", account_db)
# Before Self-destruct:  {'0x9bbfed6889322e016e0a02ee459d306fc19545d8': {'balance': 100, 'nonce': 1, 'storage': {}, 'code': b''}, '0x1000000000000000000000000000000000000c42': {'balance': 10, 'nonce': 0, 'storage': {}, 'code': b'`B`\x00R`\x01`\x1f\xf3'}}

code = b"\x60\x20\xff"  # PUSH1 0x20 (destination address) SELFDESTRUCT
evm = EVM(code, txn)
evm.run()
print("After Self-destruct: ", account_db)
# After Self-destruct:  {'0x9bbfed6889322e016e0a02ee459d306fc19545d8': {'balance': 100, 'nonce': 1, 'storage': {}, 'code': b''}, '0x0000000000000000000000000000000000000020': {'balance': 10, 'nonce': 0, 'storage': {}, 'code': bytearray(b'')}}
```

<hr>

# Summary

In this chapter, we introduced the SELFDESTRUCT instruction in the EVM that destroys the contract. It can self-destruct the contract and forcibly send its remaining ETH to another address. This instruction will be deprecated in the future, so try not to use it.
Now, we have learned 143 (99%) of the 144 opcodes, and only one is left!
