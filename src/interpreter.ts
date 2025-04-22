let source: string[] = [];
let instructions: Instruction[] = [];
let labels: Map<string, Label> = new Map();

type Opcode = "add";

type Value = Immediate | Pointer | Label;

interface Immediate {
  type: "immediate";
  value: number;
}

interface Pointer {
  type: "pointer";
  value: number;
}

interface Label {
  type: "label";
  name: string;
  value: number;
}

interface Instruction {
  lineIndex: number;
  opcode: Opcode;
  arg1: Value;
  arg2: Value;
  dest: Value;
}

function parseOpcode(src: string): Opcode {
  switch (src) {
    case "add":
      return "add";
    default:
      throw new Error(`unknown opcode '$${src}'`);
  }
}

function parseValue(src: string): Value {
  //TODO
  return parseImmediate(src);
}

function parseImmediate(src: string): Immediate {
  //TODO support decimal, hex, and binary
  //TODO support - sign for decimal
  return { type: "immediate", value: 0 };
}

function parseAddress(src: string): Pointer {
  //TODO xN
  return { type: "pointer", value: 0 };
}

function parseLabel(src: string): Label {
  //TODO
  return { type: "label", name: "", value: 0 };
}

export function load(src: string) {
  source = src.split("\n");

  instructions = [];
  for (let i = 0; i < source.length; i++) {
    const l = source[i];

    // skip comments
    if (l.trimStart()[0] === "#") continue;

    const fields = l
      .replace(",", " ")
      .split(" ")
      .filter((f) => f.length > 0);

    if (fields.length <= 0) continue;

    console.log(i, fields);

    instructions.push({
      lineIndex: i,
      opcode: parseOpcode(fields[0]),
      arg1: parseValue(fields[1]),
      arg2: parseValue(fields[2]),
      dest: parseValue(fields[3]),
    });
  }
}

export function execute() {}
