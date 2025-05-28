# Abstruct

In this chapter, we will introduce the GAS instruction in EVM and the Gas mechanism of Ethereum.

## What is Gas?

In EVM, transactions and execution of smart contracts consume computing resources. In order to prevent users from maliciously abusing network resources and to compensate validators for the computing energy consumed, Ethereum introduced a billing mechanism called Gas,
which makes each transaction have an associated cost. When initiating a transaction, the user sets a maximum amount of Gas (gasLimit) and the price per unit of Gas (gasPrice). If the transaction execution exceeds the gasLimit, the transaction will be rolled back,
but the consumed Gas will not be refunded.

## Gas Rules

Gas on Ethereum is measured in gwei, which is a sub-unit of ETH, 1 ETH = 10^9 gwei. The gas cost of a transaction is equal to the gas price per unit multiplied by the gas consumption of the transaction, that is, gasPrice * gasUsed. Gas prices change over time,
depending on the current demand for block space. Gas consumption is determined by many factors and changes with each Ethereum version. Here is a summary:
1. Calldata size: Each byte in the calldata costs gas, and the larger the size of the transaction data, the higher the gas consumption. Each zero byte in the calldata costs 4 gas, and each non-zero byte costs 16 gas (64 before Istanbul).
2. Intrinsic gas: Each transaction has an intrinsic cost of 21,000 Gas. In addition to the transaction cost, creating a contract requires 32,000 Gas. This cost is paid from the transaction before any opcode is executed.
3. Opcode fixed cost: Each opcode has a fixed cost when executed, in units of Gas. This cost is the same for all executions. For example, each ADD instruction consumes 3 Gas.
4. Opcode dynamic cost: Some instructions consume more computational resources depending on their parameters. Therefore, in addition to the fixed cost, these instructions also have a dynamic cost. For example, the Gas consumed by the SHA3 instruction increases with the length of the parameter.
5. Memory expansion cost: In the EVM, contracts can access memory using opcodes. When accessing memory at a specific offset for the first time (read or write), the memory may trigger expansion and incur gas consumption. For example, MLOAD or RETURN.
6. Access set cost: For each external transaction, EVM defines an access set, which records the contract addresses and storage slots accessed during the transaction. The access cost varies depending on whether the data has been accessed before (hot) or is being accessed for the first time (cold).
7. Gas refund: Some operations of SSTORE (such as clearing storage) can trigger Gas refund. The refund will be executed at the end of the transaction, with an upper limit of 20% of the total Gas consumption (starting from the London hard fork).

For more detailed information on Gas consumption, please refer to ![evm.codes](https://www.evm.codes/)

## GAS Instructions

The GAS instruction in the EVM pushes the remaining Gas of the current transaction onto the stack. Its opcode is 0x5A and the gas consumption is 2.

```
def gas(self):
    self.stack.append(self.txn.gasLimit - self.gasUsed)
```

Next, we implement GAS in the minimalist EVM. For teaching purposes, we currently only implement the fixed cost of some opcodes, and the rest will be implemented in the future.
First, we need to add a gasUsed property in EVM to record the consumed Gas:

```
class EVM:
    def __init__(self, ...):
        # ... other properties ...
        self.gasUsed = 0
```

Next, we need to define the fixed cost of each instruction:

```
# Fixed costs
GAS_COSTS = {
  'PUSH': 3,
  'POP': 2,
  'ADD': 3,
  'MUL': 5,
  'SUB': 3,
  # ... Fixed costs for other opcodes ...
}
```

Update the Gas consumption in each opcode implementation, such as the PUSH instruction:

```
def push(self, size):
  data = self.code[self.pc:self.pc + size]    # Get data from code according to size
  value = int.from_bytes(data, 'big')         # Convert bytes to int
  self.stack.append(value)                    # Push into stack
  self.pc += size                             # Increase pc by size units
  self.gasUsed += GAS_COSTS['PUSH']           # Update Gas consumption
```

Finally, after each opcode is executed, check if the Gas is exhausted:

```
def run(self):
  while self.pc < len(self.code) and self.success:
    op = self.next_instruction()
    # ... opcode execution logic ...

    # Check if gas is exhausted
    if self.gasUsed > self.txn.gasLimit:
      raise Exception('Out of gas!')
```

## Test

```
# Define Txn
addr = '0x1000000000000000000000000000000000000c42'
txn = Transaction(to=None, value=10, data='', 
                  caller=addr, origin=addr, thisAddr=addr, gasLimit=100, gasPrice=1)

# GAS 
code = b"\x60\x20\x5a"  # PUSH1 0x20 GAS
evm = EVM(code, txn)
evm.run()
print(evm.stack)
# output: [32, 97] 
# gasLimit=100，gasUsed=3
```

<hr>

# Summary

In this lecture, we introduced Ethereum's Gas mechanism and GAS opcodes. The Gas mechanism ensures that the computing resources of the Ethereum network are not abused by malicious code.
Through GAS instructions, smart contracts can query how much Gas is left in real time and make corresponding decisions.
So far, we have learned all 144 opcodes in EVM! Congratulations!
