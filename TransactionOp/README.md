# Abstruct

In this Chapter, we will explore 4 instructions in EVM related to the transaction context, including ADDRESS, ORIGIN, CALLER, etc. We can use these instructions to access information about the current transaction or caller.

## The basic structure of a transaction

![]()

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
