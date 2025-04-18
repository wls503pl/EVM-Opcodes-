# Abstruct

In this chapter, we will introduce 5 instructions related to log in EVM: from LOG0 to LOG4. Log is an important concept in EVM, used to record important information about contract interactions and is the basis of events in smart contracts.
These records are permanently stored on the blockchain for easy retrieval, but will not affect the state of the blockchain. It is a powerful tool for DApps and smart contract developers.

## Logs and events in the EVM

The LOG instruction in the EVM is used to create these logs. The difference between instructions LOG0 to LOG4 is the number of topics they contain. For example, LOG0 has no topics, while LOG4 has four topics.
In order to support the log function in our minimalist EVM, we first need to define a Log class to represent a log entry, which will record the contract address address that issued the log, the data part data, and the main part topics:

```
class Log:
    def __init__(self, address, data, topics=[]):
        self.address = address
        self.data = data
        self.topics = topics

    def __str__(self):
        return f'Log(address={self.address}, data={self.data}, topics={self.topics})'
```

Then, we need to add a logs list in the EVM initialization function to record these logs:

```
class EVM:
  def __init__(self, code, txn = None):

  # ... Initialize other variables ...

  self.logs = []
```

## LOG instruction

There are five Log instructions in EVM: LOG0, LOG1, LOG2, LOG3, and LOG4. The main difference between them is the number of topics they carry:
LOG0 has no topics, while LOG4 has four.The opcodes are from A0 to A4, and the gas consumption is calculated by the following formula:

```
gas = 375 + 375 * number of topics + memory expansion cost
```

The Log instruction pops 2 + n elements from the stack. The first two parameters are the memory start position mem_offset and the data length length, and n is the number of topics (depending on the specific LOG instruction).
So for LOG1, we will pop 3 elements from the stack: the memory start position, the data length, and a topic. The reason for mem_offset is that the data part of the log is stored in memory, which has low gas consumption,
while the topic part is stored directly on the stack.

Next, we implement the LOG instruction:

```
def log(self, num_topics):
    if len(self.stack) < 2 + num_topics:
        raise Exception('Stack underflow')

    mem_offset = self.stack.pop()
    length = self.stack.pop()
    topics = [self.stack.pop() for _ in range(num_topics)]

    data = self.memory[mem_offset:mem_offset + length]
    log_entry = {
        "address": self.txn.thisAddr,
        "data": data.hex(),
        "topics": [f"0x{topic:064x}" for topic in topics]
    }
    self.logs.append(log_entry)
```

Finally, we need to add support for the different LOG instructions in the run method:

```
def run(self):
    while self.pc < len(self.code):
        op = self.next_instruction()
        
        # ... Processing of other instructions ...
        
        elif op == LOG0:
            self.log(0)
        elif op == LOG1:
            self.log(1)
        elif op == LOG2:
            self.log(2)
        elif op == LOG3:
            self.log(3)
        elif op == LOG4:
            self.log(4)

```

## Test LOG0

We run a bytecode containing the LOG0 instruction: 60aa6000526001601fa0 (PUSH1 aa PUSH1 0 MSTORE PUSH1 1 PUSH1 1f LOG0).
This bytecode stores aa in memory and then uses the LOG0 instruction to output aa to the data portion of the log.

```
# LOG0
code = b"\x60\xaa\x60\x00\x52\x60\x01\x60\x1f\xa0"
evm = EVM(code, txn)
evm.run()
print(evm.logs)
# output: [{'address': '0x9bbfed6889322e016e0a02ee459d306fc19545d8', 'data': 'aa', 'topics': []}]
```

## Test LOG1

We run a bytecode containing the LOG1 instruction: 60aa60005260116001601fa1 (PUSH1 aa PUSH1 0 MSTORE PUSH 11 PUSH1 1 PUSH1 1f LOG1). This bytecode stores aa in memory, pushes 11 onto the stack, and finally uses the LOG1 instruction to output aa to the data portion of the log and 11 to the subject portion of the log.

```
# LOG1
code = b"\x60\xaa\x60\x00\x52\x60\x11\x60\x01\x60\x1f\xa1"
evm = EVM(code, txn)
evm.run()
print(evm.logs)
# output: [{'address': '0x9bbfed6889322e016e0a02ee459d306fc19545d8', 'data': 'aa', 'topics': ['0x0000000000000000000000000000000000000000000000000000000000000011']}]
```

<hr>

# Summary

In this lesson, we learned 5 instructions related to logs and events in the EVM. These instructions play a key role in smart contract development, allowing developers to permanently record important information on the blockchain without affecting the state of the blockchain. So far, we have learned 131 out of 144 opcodes!
