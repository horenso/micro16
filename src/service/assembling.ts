import { REGISTER_NAMES } from '../stores/registers';
import {
    Constant,
    Register,
    RegisterOrConstant,
    isRegister,
    isMemoryBuffer,
    MemoryBuffer,
    isConstantRegister,
    WriteOnlyBuffer,
} from './registers';

type Shift = 'left' | 'right' | null;

// Optional parentheses
interface PassThroughStatement {
    destination: Register | WriteOnlyBuffer;
    shift: Shift;
}

interface AssignmentStatement {
    destination: Register | MemoryBuffer;
    left: Register | Constant | null;
    operator: '+' | '&' | '~' | null;
    right: Register | Constant | null;
    shift: Shift;
}

type Statement = PassThroughStatement | AssignmentStatement;

interface Jump {
    condition: 'N' | 'Z' | null;
    toAddress: number;
}

interface ParsedInstruction {
    assignments: Statement[];
    jump: Jump | null;
    readWrite: 'rd' | 'wr' | null;
    mar: boolean;
    mbr: boolean;
}

interface Error {
    message: string;
}

type ParsingResult =
    | { ok: true; instruction: ParsedInstruction }
    | { ok: false; error: Error };

type AssemblingResult =
    | { ok: true; result: number }
    | { ok: false; error: Error };

class Parser {
    tokens: string[];
    current_token: string | null = null;

    seenReadWrite = false;
    seenGoto = false;

    result: ParsedInstruction = {
        assignments: [],
        jump: null,
        readWrite: null,
        mar: false,
        mbr: false,
    };

    error: Error | null = null;

    constructor(instruction: string) {
        this.tokens = instruction.split(/\s+|;/);
        this.current_token = this.nextToken();
    }

    private nextToken(): string | null {
        const last = this.tokens.shift();
        if (last === undefined) {
            return null;
        } else {
            return last;
        }
    }

    private tryParseReadWrite(current_token: 'rd' | 'wr'): void {
        if (this.seenReadWrite) {
            this.error = { message: 'Only one read/write permitted' };
            return;
        }
        this.seenReadWrite = true;
        this.result.readWrite = current_token;
        this.current_token = this.nextToken();
    }

    private tryParseGoto(): void {
        if (this.seenGoto) {
            this.error = { message: 'Only one goto permitted.' };
        }
        this.seenGoto = true;
        let condition: 'N' | 'Z' | null = null;
        if (this.current_token === 'if') {
            // Conditional jump
            this.current_token = this.nextToken();
            if (this.current_token !== 'N' && this.current_token !== 'Z') {
                this.error = { message: 'Invalid jump statement!' };
                return;
            }
            condition = this.current_token;
            this.current_token = this.nextToken();
        }
        if (this.current_token !== 'goto') {
            this.error = { message: 'Invalid jump statement!' };
            return;
        }
        this.current_token = this.nextToken();
        if (this.current_token === null) {
            this.error = { message: 'Invalid jump statement!' };
            return;
        }
        const jumpAddress = parseInt(this.current_token);
        if (jumpAddress < 0 || jumpAddress > 255) {
            this.error = { message: 'Jump address must be between 0 and 255.' };
            return;
        }
        this.result.jump = { condition: condition, toAddress: jumpAddress };
    }

    private tryParseRegisterUse(): void {
        if (
            !isRegister(this.current_token!) &&
            !isMemoryBuffer(this.current_token!)
        ) {
            this.error = { message: 'Unidentifiable register name' };
            return;
        }
        const assignment: Statement = {
            destination: this.current_token,
            left: null,
            right: null,
        };
        this.current_token = this.nextToken();
        if (this.current_token !== '<-') {
            this.result.assignments.push(assignment);
            return;
        }
        this.current_token = this.nextToken();
        if (
            !isRegister(this.current_token!) &&
            !isMemoryBuffer(this.current_token!) &&
            !isConstantRegister(this.current_token!)
        ) {
            this.error = { message: 'Unidentifiable register name' };
            return;
        }
        assignment.left = this.current_token;
        this.current_token = this.nextToken();
        switch (this.current_token) {
            case '+':
                assignment.operator = '+';
            case '&':
                assignment.operator = '&';
            case '~':
                assignment.operator = '~';
            default:
                this.error = {
                    message: `Unknown operator '${this.current_token}'`,
                };
                return;
        }
        // Operator

        return false;
    }

    public parse(): ParsingResult {
        while (this.current_token !== null && this.error === null) {
            if (this.current_token === 'goto' || this.current_token === 'if') {
                this.tryParseGoto();
            } else if (
                this.current_token === 'rd' ||
                this.current_token === 'wr'
            ) {
                this.tryParseReadWrite(this.current_token);
            } else {
                this.tryParseRegisterUse();
            }
        }
        return this.result;
    }
}

class Assembler {
    private instruction: ParsedInstruction;
    private result: number = 0;

    private busA: RegisterOrConstant | null = null;
    private busB: RegisterOrConstant | null = null;

    constructor(instruction: ParsedInstruction) {
        this.instruction = instruction;
    }

    private assembleAssignments() {
        for (let assignment of this.instruction.assignments) {
            // ...
            // Figure out how these assignments assemble
            const destination = assignment.destination;
            const left = assignment.left;
            const right = assignment.right;
        }
    }

    public assemble(): AssemblingResult {
        const readWrite = this.instruction.readWrite;
        if (readWrite === 'rd') {
            this.result |= 0x0060_0000;
        } else if (readWrite === 'wr') {
            this.result |= 0x0020_0000;
        }

        const jump = this.instruction.jump;
        if (jump !== null) {
            if (jump.condition === 'N') {
                this.result |= 0x2000_0000;
            } else if (jump.condition === 'Z') {
                this.result |= 0x4000_0000;
            } else {
                this.result |= 0x6000_0000;
            }
            this.result |= jump.toAddress;
        }

        if (this.instruction.mar) {
            this.result |= 0x0080_0000;
        }
        if (this.instruction.mbr) {
            this.result |= 0x0100_0000;
        }

        return { ok: true, result: this.result };
    }
}

export function parseLine(line: string): ParsingResult {
    const parser = new Parser(line);
    return parser.parse();
}

export function assembleInstruction(
    instruction: ParsedInstruction
): AssemblingResult {
    const assembler = new Assembler(instruction);
    return assembler.assemble();
}

export function assembleLine(line: string): AssemblingResult {
    const paredLine = parseLine(line);
    if (paredLine.ok) {
        return assembleInstruction(paredLine.instruction);
    } else {
        return paredLine;
    }
}
