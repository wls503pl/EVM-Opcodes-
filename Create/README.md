# Abstruct

In this chapter, we introduce the CREATE instruction in EVM, which allows contracts to create new contracts.

## initcode

As we mentioned before, there are two types of transactions in Ethereum, one is contract call and the other is contract creation. In the transaction of contract creation, the to field is set to empty,
and the data field should be filled with the initial code (initcode) of the contract. Initcode is also bytecode, but it is only executed once when the contract is created,
with the purpose of setting the necessary state for the new contract and returning the final contract bytecode (contract code).

Next, let's look at a simple initcode: 63ffffffff6000526004601cf3. Its instruction form is:
```
PUSH4 ffffffff
PUSH1	00
MSTORE	
PUSH1	04
PUSH1	1c
RETURN	
```

It first uses the MSTORE instruction to copy ffffffff to memory, and then uses the RETURN instruction to copy it to the return data. This initcode will set the bytecode of the new contract to ffffffff.

## CREATE

In EVM, when a contract wants to create a new contract, it uses the CREATE instruction. Its simplified process is:
1. Pop value (ETH sent to the new contract), mem_offset, and length (the initial location and length of the new contract’s initcode in memory) from the stack.
2. Calculate the new contract's address, the calculation method is:
```
address = keccak256(rlp([sender_address,sender_nonce]))[12:]
```
3. Update ETH balance.
4. Initialize a new EVM context evm_create for executing initcode.
5. Execute initcode in evm_create.
6. If the execution is successful, the created account status is updated: balance is updated, nonce is initialized to 0, the code field is set to the return data of evm_create, and the storage field is set to the storage of evm_create.
7. If successful, the new contract address is pushed onto the stack; if failed, 0 is pushed onto the stack.

Next, we implement the CREATE instruction in the minimalist EVM:
```
def create(self):
    if len(self.stack) < 3:
        raise Exception('Stack underflow')

    # Pop the stack data
    value = self.stack.pop()
    mem_offset = self.stack.pop()
    length = self.stack.pop()

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

    # Generate a new contract address
    # (refer to the method in geth, using the creator's address and nonce)
    creator_nonce = creator_account['nonce']
    new_contract_address_bytes = sha3.keccak_256(self.txn.thisAddr.encode() + str(creator_nonce).encode()).digest()
    new_contract_address = '0x' + new_contract_address_bytes[-20:].hex()    # Take the last 20 bytes as the address

    # Use txn to build context
    ctx = Transaction(to=new_contract_address,
                        data=init_code,
                        value=value,
                        caller=self.txn.thisAddr,
                        origin=self.txn.origin,
                        thisAddr=new_contract_address,
                        gasPrice=self.txn.gasPrice,
                        gasLimit=self.txn.gasLimit)

    # Create and run a new EVM instance
    evm_create = EVM(init_code, ctx)
    evm_create.run()

    # If the EVM instance returns an error,
    # push 0 to indicate creation failed
    if evm_create.success == False:
        self.stack.append(0)
        return

    # Update the creator's nonce
    creator_account['nonce'] += 1

    # Store the state of the contract
    account_db[new_contract_address] = {
        'balance': value,
        'nonce': 0,  # 新合约的nonce从0开始
        'storage': evm_create.storage,
        'code': evm_create.returnData
    }
    
    # Press the newly created contract address
    self.stack.append(int(new_contract_address, 16))
```

## Test

1. Use the CREATE command to deploy a new contract, send 9 wei, but do not deploy any code:
```
# CREATE (empty code, 9 wei balance)
code = b"\x5f\x5f\x60\x09\xf0"
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-1]))
# output: 0x260144093a2920f68e1ae2e26b3bd15ddd610dfe
print(account_db[hex(evm.stack[-1])])
# output: {'balance': 9, 'nonce': 0, 'storage': {}, 'code': bytearray(b'')}
```

2. Use the CREATE instruction to deploy a new contract and set the code to ffffffff:
```
# CREATE (with 4x FF)
code = b"\x6c\x63\xff\xff\xff\xff\x60\x00\x52\x60\x04\x60\x1c\xf3\x60\x00\x52\x60\x0d\x60\x13\x60\x00\xf0"
# PUSH13 0x63ffffffff6000526004601cf3 PUSH1 0x00 MSTORE PUSH1 0x0d PUSH1 0x19 PUSH1 0x00 CREATE
evm = EVM(code, txn)
evm.run()
print(hex(evm.stack[-1]))
# output: 0x6dddd3288a19f0bf4eee7bfb9e168ad29e1395d0
print(account_db[hex(evm.stack[-1])])
# {'balance': 0, 'nonce': 0, 'storage': {}, 'code': bytearray(b'\xff\xff\xff\xff')}
```

<hr>

# Summary

In this chapter, we introduced the instruction CREATE for creating contracts in EVM. Through it, contracts can create other contracts to achieve more complex logic and functions. We have learned 141 (98%) of the 144 opcodes!
