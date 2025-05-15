# Abstruct

In the previous chapter, we introduced the CREATE instruction, which enables contracts to create other contracts. In this lecture, we will further explore the CREATE2 instruction, which provides a new way to determine the address of a new contract.

## CREATE vs CREATE2

The traditional CREATE instruction determines the address of the new contract by the caller's address and nonce, while CREATE2 provides a new calculation method that allows us to predict the address of the contract before it is deployed.
Unlike **CREATE**, **CREATE2** uses the caller's address, salt (a custom 256-bit value), and the hash of initcode to determine the address of the new contract. The calculation method is as follows:
```
address = keccak256( 0xff + sender_address + salt + keccak256(init_code))[12:]
```

The advantage of this is that as long as you know the initcode, salt value and sender's address, you can know the address of the new contract in advance without deploying it now. The address calculated by CREATE depends on the nonce of the deploying account, that is,
when the nonce is uncertain (the contract has not been deployed yet, the nonce may increase), the address of the new contract cannot be determined.

## CREATE2

In the EVM, the simplified flow of the CREATE2 instruction is as follows:
1. Pop value (ETH sent to the new contract), mem_offset, length (the initial location and length of the new contract’s initcode in memory), and salt from the stack.
2. Use the formula above to calculate the address of the new contract.
3. The subsequent steps are the same as the CREATE instruction: initialize a new EVM context, execute initcode, update the created account status, and return the new contract address or 0 (if failed).

```
def create2(self):
    if len(self.stack) < 4:
        raise Exception('Stack underflow')

    value = self.stack.pop()
    mem_offset = self.stack.pop()
    length = self.stack.pop()
    salt = self.stack.pop()

    # Expand Memory
    if len(self.memory) < mem_offset + length:
        self.memory.extend([0] * (mem_offset + length - len(self.memory)))

    # Get the initialization code
    init_code = self.memory[mem_offset: mem_offset + length]

    # Check if the creator's balance is sufficient
    creator_account = account_db[self.txn.thisAddr]
    if creator_account['balance'] < value:
        raise Exception('Insufficient balance to create contract!')

    # Deduct the specified amount from the creator
    creator_account['balance'] -= value

    # Generate a new contract address (refer to the method in geth, using salt and initcode hash)
    init_code_hash = sha3.keccak_256(init_code).digest()
    data_to_hash = b'\xff' + self.txn.thisAddr.encode() + str(salt).encode() + init_code_hash
    new_contract_address_bytes = sha3.keccak_256(data_to_hash).digest()
    new_contract_address = '0x' + new_contract_address_bytes[-20:].hex()      # Take the last 20 bytes as the address

    # Use txn to build context and execute
    ctx = Transaction(to=new_contract_address,
                        data=init_code,
                        value=value,
                        caller=self.txn.thisAddr,
                        origin=self.txn.origin,
                        thisAddr=new_contract_address,
                        gasPrice=self.txn.gasPrice,
                        gasLimit=self.txn.gasLimit)

    evm_create2 = EVM(init_code, ctx)
    evm_create2.run()

    # If the EVM instance returns an error, push 0 to indicate creation failed
    if evm_create2.success == False:
        self.stack.append(0)
        return

    # Update the creator's nonce
    creator_account['nonce'] += 1

    # Store the state of the contract
    account_db[new_contract_address] = {
        'balance': value,
        'nonce': 0,
        'storage': evm_create2.storage,
        'code': evm_create2.returnData
    }

    # Press the newly created contract address
    self.stack.append(int(new_contract_address, 16))
```

## Test

1. Use the CREATE2 instruction to deploy a new contract, send 9 wei, but do not deploy any code:

```
# CREATE2 (empty code, 9 wei balance)
code = b"\x5f\x5f\x5f\x60\x09\xf5"
# PUSH0 PUSH0 PUSH0 PUSH1 0x09 CREATE2
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-1]))
# output: 0x260144093a2920f68e1ae2e26b3bd15ddd610dfe
print(account_db[hex(evm.stack[-1])])
# output: {'balance': 9, 'nonce': 0, 'storage': {}, 'code': bytearray(b'')}
```

2. Use the CREATE2 instruction to deploy a new contract and set the code to ffffffff:

```
# CREATE2 (with 4x FF)
code = b"\x6c\x63\xff\xff\xff\xff\x60\x00\x52\x60\x04\x60\x1c\xf3\x60\x00\x52\x60\x00\x60\x0d\x60\x13\x60\x00\xf5"
# PUSH13 0x63ffffffff6000526004601cf3 PUSH1 0x00 MSTORE PUSH1 0x00 PUSH1 0x0d PUSH1 0x13 PUSH1 0x00 CREATE2
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-1]))
# output: 0x6dddd3288a19f0bf4eee7bfb9e168ad29e1395d0
print(account_db[hex(evm.stack[-1])])
# {'balance': 0, 'nonce': 0, 'storage': {}, 'code': bytearray(b'\xff\xff\xff\xff')}
```

<hr>

# Summary

In this lecture, we introduced another instruction for creating contracts in EVM, CREATE2, through which contracts can not only create other contracts, but also predict the address of new contracts.
The LP address in Uniswap v2 is calculated using this method. Now, we have learned 142 out of 144 opcodes (98.6%)!
