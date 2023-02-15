import {
    isMemoryBuffer,
    isReadable,
    isRegister,
    isWritable,
} from '../registers';

import {
    Error,
    Expression,
    isOperator,
    ParsedInstruction,
    Result,
    Shift,
    Statement,
} from './types';

export function parseLine(line: string): Result<ParsedInstruction> {
    const parser = new Parser(line);
    return parser.parse();
}

class Parser {
    tokens: string[];
    current_token?: string;

    seenReadWrite = false;
    seenGoto = false;

    result: ParsedInstruction = {
        statements: [],
    };

    error: Error | undefined;

    constructor(instruction: string) {
        this.tokens = instruction.split(/\s+|;/);
        this.current_token = this.nextToken();
    }

    private nextToken(): string | undefined {
        return this.tokens.shift();
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
        let condition: 'N' | 'Z' | undefined;
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
        if (this.current_token === undefined) {
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

    private parseExpression(): Result<Expression> {
        return { ok: true, result: { left: 'R8' } };
    }

    private tryParseStatement(): void {
        let shift: Shift | undefined;

        // It could start with a location or a call to lsh/rsh.
        if (this.current_token === 'lsh') {
            shift = 'left';
            const expression = this.parseExpression();
        } else if (this.current_token === 'rsh') {
            shift = 'right';
            const expression = this.parseExpression();
        }
        if (
            !isRegister(this.current_token!) &&
            !isMemoryBuffer(this.current_token!)
        ) {
            this.error = {
                message: `Unidentifiable register name ${this.current_token}`,
            };
            return;
        }
        const location = this.current_token;
        this.current_token = this.nextToken();
        if (this.current_token !== '<-') {
            if (!isReadable(location)) {
                this.error = { message: `${location} is not readable!` };
                return;
            }
            this.result.statements.push({
                type: 'PassThrough',
                dest: location,
                shift: null,
            });
            return;
        }
        if (!isWritable(location)) {
            this.error = { message: `${location} is not writable!` };
            return;
        }
        this.current_token = this.nextToken();
        if (this.current_token === null) {
            this.error = { message: `Invalid statement.` };
            return;
        }
        const left = this.current_token;
        if (!isReadable(left)) {
            this.error = { message: `${left} is not readable!` };
            return;
        }
        this.current_token = this.nextToken();
        if (this.current_token === null) {
            this.error = { message: `Invalid statement.` };
            return;
        }
        const operator = this.current_token;
        if (!isOperator(operator)) {
            this.error = {
                message: `Unknown operator '${this.current_token}'`,
            };
            return;
        }
        this.current_token = this.nextToken();
        if (this.current_token === null) {
            this.error = { message: `Invalid statement.` };
            return;
        }
        const right = this.current_token;
        if (!isReadable(right)) {
            this.error = { message: `${right} is not readable!` };
            return;
        }
        this.result.statements.push({
            type: 'Assignment',
            dest: location,
            left: left,
            right: right,
            operator: operator,
        });
    }

    private checkStatement() {}

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
                this.tryParseStatement();
            }
        }
        if (this.error !== null) {
            return { ok: false, error: this.error };
        } else {
            return { ok: true, instruction: this.result };
        }
    }
}
