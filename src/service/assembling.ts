import { REGISTER_NAMES } from '../stores/registers';
import {
    Constant,
    Register,
    isRegister,
    isMemoryBuffer,
    MemoryBuffer,
    isConstantRegister,
} from './registers';

interface Assignment {
    destination: Register | MemoryBuffer;
    left: Register | Constant | null;
    right: Register | Constant | null;
}

interface Jump {
    condition: 'N' | 'Z' | null;
    line: number;
}

interface ParsedInstruction {
    assignments: Assignment[];
    jump: Jump | null;
    readWrite: 'rd' | 'wr' | null;
    mar: boolean;
    mbr: boolean;
}

interface ParsingError {
    message: string;
}

type ParsingResult =
    | { ok: true; instruction: ParsedInstruction }
    | { ok: false; error: ParsingError };

interface AssemblingError {
    message: string;
}

type AssemblingResult =
    | { ok: true; result: number }
    | { ok: false; error: AssemblingError };

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
    }
    
    error: ParsingError | null = null;

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
            this.error = {message: 'Only one read/write permitted'};
            return;
        }
        this.seenReadWrite = true;
        this.result.readWrite = current_token;
        this.current_token = this.nextToken();
    }

    private tryParseGoto(): void {
        if (this.seenGoto) {
            this.error = {message: 'Only one goto permitted.'};
        }
        this.seenGoto = true;
        let condition: 'N' | 'Z' | null = null;
        if (this.current_token === 'if') {
            // Conditional jump
            this.current_token = this.nextToken();
            if (this.current_token !== 'N' && this.current_token !== 'Z') {
                this.error = {message: 'Invalid jump statement!'};
                return;
            }
            condition = this.current_token;
            this.current_token = this.nextToken();
        }
        if (this.current_token !== 'goto') {
            this.error = {message: 'Invalid jump statement!'};
            return;
        }
        this.current_token = this.nextToken();
        if (this.current_token === null) {
            this.error = {message: 'Invalid jump statement!'};
            return;
        }
        const jumpAddress = parseInt(this.current_token);
        if (jumpAddress < 0 || jumpAddress > 255) {
            this.error = {message: 'Jump address must be between 0 and 255.'};
            return;
        }
        this.result.jump = {condition: condition, line: jumpAddress};
    }

    private tryParseRegisterUse(): void {
        if (!isRegister(this.current_token!) && !isMemoryBuffer(this.current_token!)) {
            this.error = {message: 'Unidentifiable register name'};
            return;
        }
        const assignment: Assignment = {destination: this.current_token, left: null, right: null};
        this.current_token = this.nextToken();
        if (this.current_token !== '<-') {
            this.result.assignments.push(assignment);
            return;
        } else {
            this.current_token = this.nextToken();
            if (!isRegister(this.current_token!) && !isMemoryBuffer(this.current_token!) && !isConstantRegister(this.current_token!)) {
                this.error = {message: 'Unidentifiable register name'};
                return;
            }
            assignment.left = this.current_token;
        }
        return false;
    }

    public parse(): ParsingResult {
        while (this.current_token !== null && this.error === null) {
                if (this.current_token === 'goto' || this.current_token === 'if') {
                    this.tryParseGoto();
                } else if (this.current_token === 'rd' || this.current_token === 'wr') {
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

    constructor(instruction: ParsedInstruction) {
        this.instruction = instruction;
    }

    public assemble(): AssemblingResult {
        const readWrite = this.instruction.readWrite;
        if (readWrite === 'r') {
            this.result |= 0x0060_0000;
        } else if (readWrite === 'w') {
            this.result |= 0x0020_0000;
        }
        return {ok: true, result: this.result};
    }
}

export function assembleLine(line: string): number | AssemblingError {
    const assembler = new Assembler(line);
    return assembler.assemble();
}
