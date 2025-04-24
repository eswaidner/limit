import { Limit } from "./limit";

let source: string[] = [];
let instructions: Instruction[] = [];
let labels: Map<string, number> = new Map();

const maxInt32 = 2 ** 31 - 1;
const minInt32 = -(2 ** 31);
const maxUint32 = 2 ** 32 - 1;

type Op = MemoryOp | ControlOp;

// prettier-ignore
type MemoryOp = "add" | "sub" | "mul" | "div" | "mod" | "lsh" | "rsh" | "and" | "or" | "xor";
type ControlOp = "jeq" | "jne";

// prettier-ignore
const opcodes: Set<string> = new Set([
  "add",    "lsh",    "jeq",
  "sub",    "rsh",    "jne",
  "mul",    "and",
  "div",    "or" ,
  "mod",    "xor",
]);

type Value = Immediate | MemoryAccess | InstructionIndex;

interface Immediate {
  type: "immediate";
  value: number;
}

interface MemoryAccess {
  type: "memory-access";
  value: number;
}

interface InstructionIndex {
  type: "instruction-index";
  value: number;
}

interface Instruction {
  lineIndex: number;
  opcode: Op;
  arg1: Value;
  arg2: Value;
  dest: Value;
}

function isDigit(char: string): boolean {
  return char[0] >= "0" && char[0] <= "9";
}

function parseOpcode(src: string): Op {
  if (!opcodes.has(src)) throw new Error(`unknown instruction '${src}'`);
  return src as Op;
}

function parseValue(src: string): Value {
  if (src[0] === "[") return parseMemoryAccess(src);
  if (isDigit(src[0]) || src[0] === "-") return parseImmediate(src);
  else return parseLabel(src);
}

function parseImmediate(src: string): Immediate {
  const neg = src[0] === "-";
  let num = src.slice(neg ? 1 : 0, src.length);

  // detect base from prefix
  let base = 10;
  if (num[0] === "0") {
    if (num[1] === "x") base = 16;
    else if (num[1] === "b") base = 2;
  }

  if (base !== 10) {
    if (neg) throw new Error(`'-' is only valid for decimal immediates`);

    // remove base prefix if needed
    num = num.slice(2, num.length);
  }

  const value = parseInt(num, base) * (neg ? -1 : 1);

  if (isNaN(value)) throw new Error(`invalid immediate '${src}'`);

  if (base === 10) {
    if (value > maxInt32 || value < minInt32) {
      throw new Error(`immediate out of range '${src}'`);
    }
  } else {
    if (value > maxUint32) {
      throw new Error(`immediate out of range '${src}'`);
    }
  }

  return { type: "immediate", value };
}

function parseMemoryAccess(src: string): MemoryAccess {
  if (src[0] !== "[" || src[src.length - 1] !== "]") {
    throw new Error(`invalid memory access syntax '${src}'`);
  }

  const address = parseInt(src.slice(1, src.length - 1));
  //TODO check if in memory address range

  return { type: "memory-access", value: address };
}

function parseLabel(src: string): InstructionIndex {
  const value = labels.get(src);
  if (value === undefined) throw new Error(`undefined label '${src}'`);
  return { type: "instruction-index", value };
}

function validateLabel(name: string) {
  if (!name.match(/[a-zA-Z_][0-9a-zA-Z_]./)) {
    throw new Error(`invalid label '${name}'`);
  }
}

export function load(src: string) {
  source = src.split("\n");

  // label definition prepass
  let instructionCount = 0;
  for (let i = 0; i < source.length; i++) {
    const line = source[i].trim();

    // skip comments
    if (line[0] === "#") continue;

    // skip blank lines
    if (line.length <= 0) continue;

    // treat as label definition
    const endIdx = line.length - 1;
    if (line[endIdx] === ":") {
      const name = line.slice(0, endIdx);
      validateLabel(name);

      if (labels.has(name)) {
        throw new Error(`label redefinition '${name}' at line ${i}`);
      }

      labels.set(name, instructionCount);
      continue;
    }

    instructionCount += 1;
  }

  // parse instructions
  instructions = [];
  for (let i = 0; i < source.length; i++) {
    const line = source[i].trim();

    // skip comments
    if (line[0] === "#") continue;

    const fields = line
      .split(" ")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // skip blank lines
    if (fields.length <= 0) continue;

    // skip label definitions
    const endIdx = fields[0].length - 1;
    if (fields[0][endIdx] === ":") continue;

    const opcode = parseOpcode(fields[0]);

    const arg1 = parseValue(fields[1]);
    if (arg1.type === "instruction-index") {
      throw new Error(`arg1 cannot be a label (line ${i})`);
    }

    const arg2 = parseValue(fields[2]);
    if (arg2.type === "instruction-index") {
      throw new Error(`arg2 cannot be a label (line ${i})`);
    }

    const outArrow = fields[3];
    if (outArrow !== "->") throw new Error(`missing output arrow`);

    const dest = parseValue(fields[4]);

    instructions.push({ lineIndex: i, opcode, arg1, arg2, dest });
  }
}

export function execute() {
  const mem = Limit.memory();

  // execute instructions
  let pc = 0;
  let i = 0;
  const numInstructions = instructions.length;
  while (pc < numInstructions) {
    pc = executeInstruction(pc, instructions[pc], mem);

    if (i > 1000) break; //TEMP
    i += 1;
  }
}

function executeInstruction(
  pc: number,
  i: Instruction,
  mem: Uint32Array,
): number {
  const a = numFromValue(i.arg1, mem);
  const b = numFromValue(i.arg2, mem);
  const dest = numFromValue(i.dest, mem);

  // prettier-ignore
  switch (i.opcode) {
    case "add": add(a, b, dest, mem); break;
    case "sub": sub(a, b, dest, mem); break;
    case "mul": mul(a, b, dest, mem); break;
    case "div": div(a, b, dest, mem); break;
    case "mod": mod(a, b, dest, mem); break;

    case "lsh": lsh(a, b, dest, mem); break;
    case "rsh": rsh(a, b, dest, mem); break;
    case "and": and(a, b, dest, mem); break;
    case "or":   or(a, b, dest, mem); break;
    case "xor": xor(a, b, dest, mem); break;

    case "jeq": return jeq(a, b, dest, pc);
    case "jne": return jne(a, b, dest, pc);

    default: throw new Error(`instruction not implemented '${i.opcode}'`);
  }

  return pc + 1;
}

function numFromValue(val: Value, mem: Uint32Array): number {
  switch (val.type) {
    case "immediate":
      return val.value;
    case "memory-access":
      return mem[val.value];
    case "instruction-index":
      return val.value;
  }
}

/* MEMORY */
function add(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a + b;
}

function sub(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a - b;
}

function mul(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a * b;
}

function div(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = Math.floor(a / b);
}

function mod(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a % b;
}

function lsh(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a << b;
}

function rsh(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a >>> b;
}

function and(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a & b;
}

function or(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a | b;
}

function xor(a: number, b: number, dest: number, mem: Uint32Array) {
  mem[dest] = a ^ b;
}

/* CONTROL */
function jeq(a: number, b: number, dest: number, pc: number): number {
  return a === b ? dest : pc + 1;
}

function jne(a: number, b: number, dest: number, pc: number): number {
  return a !== b ? dest : pc + 1;
}
