# Abstruct

In this chapter, we will introduce 9 instructions in EVM for querying block information, including BLOCKHASH, COINBASE, PREVRANDAO, etc. We will add support for these operations in a minimalist version of EVM written in Python.

## Block Information

We often use blockchain information when writing smart contracts. For example, when generating pseudo-random numbers, we use blockhash, block.number, and block.timestamp:

```
/**
 * Generate pseudo-random numbers on the chain
 * Fill in some global variables/custom variables on the chain in keccak256 (abi.encodePacked())
 * Convert to uint256 type when returning
 */
function getRandomOnchain() public view returns(uint256) {
  /*
   * In this example, the randomness on the chain only depends on the block hash, caller address, and block time.
   * To improve randomness, you can add some more attributes such as nonce, etc., but it cannot fundamentally solve the security problem.
   */
  bytes32 randomBytes = keccak256(abi.encodePacked(blockhash(block.number-1), msg.sender, block.timestamp));
  return uint256(randomBytes);
```

EVM provides a series of instructions for smart contracts to access information about current or historical blocks, including block hash, timestamp, coinbase, etc.
This information is usually stored in the block header, but we can simulate this block information by adding the current_block attribute in the minimalist EVM:

```
def __init__(self, code):
    self.code = code
    self.pc = 0
    self.stack = []
    self.memory = bytearray()
    self.current_block = {
        "blockhash": 0x7527123fc877fe753b3122dc592671b4902ebf2b325dd2c7224a43c0cbeee3ca,
        "coinbase": 0x388C818CA8B9251b393131C08a736A67ccB19297,
        "timestamp": 1625900000,
        "number": 17871709,
        "prevrandao": 0xce124dee50136f3f93f19667fb4198c6b94eecbacfa300469e5280012757be94,
        "gaslimit": 30,
        "chainid": 1,
        "selfbalance": 100,
        "basefee": 30,
    }
```

## Block information command

Below, we introduce these block information commands:

1. **BLOCKHASH**: Query the hash of a specific block (the most recent 256 blocks, excluding the current block), its opcode is 0x40, and the gas cost is 20. It pops a value from the stack as the block height (block number),
   then pushes the hash of the block onto the stack, and returns 0 if it does not belong to the most recent 256 blocks (you can use the NUMBER instruction to query the current block height). But for simplicity, we only consider the current block here.

```
def blockhash(self):
  if len(self.stack) < 1:
    raise Exception('Stack underflow')
  number = self.stack.pop()
  # In real scenarios, you will need to access the historical block hash
  if number == self.current_block["number"]:
    self.stack.append(self.current_block["blockhash"])
  else:
    self.stack.append(0)      # If it is not the current block, return 0
```

2. **COINBASE**: Push the coinbase (miner/beneficiary) address of the current block onto the stack. Its opcode is 0x41 and its gas cost is 2.

```
def coinbase(self):
    self.stack.append(self.current_block["coinbase"])
```

3. **TIMESTAMP**: Push the timestamp of the current block into the stack. Its opcode is 0x42 and the gas cost is 2.

```
def timestamp(self):
    self.stack.append(self.current_block["timestamp"])
```

4. **NUMBER**: Push the current block height onto the stack. Its opcode is 0x43 and its gas cost is 2.

```
def number(self):
    self.stack.append(self.current_block["number"])
```

5. **PREVRANDAO**: Replaces the original DIFFICULTY (0x44) opcode, whose return value is the output of the beacon chain randomness beacon.
   This change allows smart contracts to continue to obtain randomness from the original DIFFICULTY opcode after Ethereum switches to Proof of Stake (PoS). Its opcode is 0x44 and the gas consumption is 2.

```
def prevrandao(self):
    self.stack.append(self.current_block["prevrandao"])
```

6. **GASLIMIT**: Pushes the gas limit of the current block onto the stack. Its opcode is 0x45 and its gas cost is 2.

```
def gaslimit(self):
    self.stack.append(self.current_block["gaslimit"])
```

7. **CHAINID**: Push the current chain ID onto the stack. Its opcode is 0x46 and its gas cost is 2.

```
def chainid(self):
    self.stack.append(self.current_block["chainid"])
```

8. **SELFBALANCE**: Push the current balance of the contract onto the stack. Its opcode is 0x47 and the gas cost is 5.

```
def selfbalance(self):
    self.stack.append(self.current_block["selfbalance"])
```

9. **BASEFEE**: Pushes the base fee of the current block onto the stack. Its opcode is 0x48 and the gas cost is 2.

```
def basefee(self):
    self.stack.append(self.current_block["basefee"])
```

Next, we add support for these opcodes in the minimal EVM:

```
BLOCKHASH = 0x40
COINBASE = 0x41
TIMESTAMP = 0x42
NUMBER = 0x43
PREVRANDAO = 0x44
GASLIMIT = 0x45
CHAINID = 0x46
SELFBALANCE = 0x47
BASEFEE = 0x48

def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()

        # ... Processing of other instructions ...

        elif op == BLOCKHASH:
            self.blockhash()
        elif op == COINBASE:
            self.coinbase()
        elif op == TIMESTAMP:
            self.timestamp()
        elif op == NUMBER:
            self.number()
        elif op == PREVRANDAO:
            self.prevrandao()
        elif op == GASLIMIT:
            self.gaslimit()
        elif op == CHAINID:
            self.chainid()
        elif op == SELFBALANCE:
            self.selfbalance()
        elif op == BASEFEE:
            self.basefee()        
```

# Summary

In this lecture, we introduced the instructions related to blockchain information in EVM, which allow smart contracts to access information related to the blockchain they are in.
This information has many uses, such as determining whether a transaction has timed out or checking the balance of a contract.
