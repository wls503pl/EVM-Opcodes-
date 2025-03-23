const { ethers } = require("ethers");

// Your Bytecode
const bytecode = "6080604052348015600e575f80fd5b5060af80601a5f395ff3fe6080604052348015600e575f80fd5b50600436106026575f3560e01c80634f2be91f14602a575b5f80fd5b60306044565b604051603b91906062565b60405180910390f35b5f6002905090565b5f819050919050565b605c81604c565b82525050565b5f60208201905060735f8301846055565b9291505056fea2646970667358221220ec0a9152a89a3614a7161287469681b57d36a105b477a5f13699cdf817d2989464736f6c634300081a0033";

// Parsing Bytecodes into Opcodes
function disassemble(bytecode) {
    let opcodes = [];
    let i = 0;

    while (i < bytecode.length) {
        let opcode = bytecode.slice(i, i + 2);
        i += 2;

        if (opcode >= "60" && opcode <= "7f") { // PUSH1 - PUSH32
            let pushSize = parseInt(opcode, 16) - 0x5f;
            let pushData = bytecode.slice(i, i + pushSize * 2);
            i += pushSize * 2;
            opcodes.push(`PUSH${pushSize} 0x${pushData}`);
        } else {
            opcodes.push(getOpcodeName(opcode));
        }
    }
    return opcodes.join("\n");
}

// Get Opcode Name
function getOpcodeName(opcode) {
    const opcodeMap = {
        "00": "STOP",
        "01": "ADD",
        "02": "MUL",
        "03": "SUB",
        "04": "DIV",
        "05": "SDIV",
        "06": "MOD",
        "07": "SMOD",
        "08": "ADDMOD",
        "09": "MULMOD",
        "0a": "EXP",
        "0b": "SIGNEXTEND",
        "10": "LT",
        "11": "GT",
        "12": "SLT",
        "13": "SGT",
        "14": "EQ",
        "15": "ISZERO",
        "16": "AND",
        "17": "OR",
        "18": "XOR",
        "19": "NOT",
        "1a": "BYTE",
        "1b": "SHL",
        "1c": "SHR",
        "1d": "SAR",
        "20": "SHA3",
        "30": "ADDRESS",
        "31": "BALANCE",
        "32": "ORIGIN",
        "33": "CALLER",
        "34": "CALLVALUE",
        "35": "CALLDATALOAD",
        "36": "CALLDATASIZE",
        "37": "CALLDATACOPY",
        "38": "CODESIZE",
        "39": "CODECOPY",
        "3a": "GASPRICE",
        "3b": "EXTCODESIZE",
        "3c": "EXTCODECOPY",
        "3d": "RETURNDATASIZE",
        "3e": "RETURNDATACOPY",
        "3f": "EXTCODEHASH",
        "40": "BLOCKHASH",
        "41": "COINBASE",
        "42": "TIMESTAMP",
        "43": "NUMBER",
        "44": "DIFFICULTY",
        "45": "GASLIMIT",
        "46": "CHAINID",
        "47": "SELFBALANCE",
        "48": "BASEFEE",
        "50": "POP",
        "51": "MLOAD",
        "52": "MSTORE",
        "53": "MSTORE8",
        "54": "SLOAD",
        "55": "SSTORE",
        "56": "JUMP",
        "57": "JUMPI",
        "58": "PC",
        "59": "MSIZE",
        "5a": "GAS",
        "5b": "JUMPDEST",
        "60": "PUSH1",
        "61": "PUSH2",
        "62": "PUSH3",
        "63": "PUSH4",
        "64": "PUSH5",
        "65": "PUSH6",
        "66": "PUSH7",
        "67": "PUSH8",
        "68": "PUSH9",
        "69": "PUSH10",
        "6a": "PUSH11",
        "6b": "PUSH12",
        "6c": "PUSH13",
        "6d": "PUSH14",
        "6e": "PUSH15",
        "6f": "PUSH16",
        "70": "PUSH17",
        "71": "PUSH18",
        "72": "PUSH19",
        "73": "PUSH20",
        "74": "PUSH21",
        "75": "PUSH22",
        "76": "PUSH23",
        "77": "PUSH24",
        "78": "PUSH25",
        "79": "PUSH26",
        "7a": "PUSH27",
        "7b": "PUSH28",
        "7c": "PUSH29",
        "7d": "PUSH30",
        "7e": "PUSH31",
        "7f": "PUSH32",
        "80": "DUP1",
        "81": "DUP2",
        "82": "DUP3",
        "83": "DUP4",
        "84": "DUP5",
        "85": "DUP6",
        "86": "DUP7",
        "87": "DUP8",
        "88": "DUP9",
        "89": "DUP10",
        "8a": "DUP11",
        "8b": "DUP12",
        "8c": "DUP13",
        "8d": "DUP14",
        "8e": "DUP15",
        "8f": "DUP16",
        "90": "SWAP1",
        "91": "SWAP2",
        "92": "SWAP3",
        "93": "SWAP4",
        "94": "SWAP5",
        "95": "SWAP6",
        "96": "SWAP7",
        "97": "SWAP8",
        "98": "SWAP9",
        "99": "SWAP10",
        "9a": "SWAP11",
        "9b": "SWAP12",
        "9c": "SWAP13",
        "9d": "SWAP14",
        "9e": "SWAP15",
        "9f": "SWAP16",
        "f3": "RETURN",
        "fd": "REVERT",
        "fe": "INVALID",
        "ff": "SELFDESTRUCT"
    };
    return opcodeMap[opcode.toLowerCase()] || `UNKNOWN(${opcode})`;
}

// Run the analysis and print
console.log(disassemble(bytecode));
