import { REGISTER_NAMES } from '../stores/registers';
import {
    Register,
    isRegister,
    getRegisterIndex,
    RefisterOrMemoryBurffer,
    isMemoryBuffer,
} from './registers';

export class AssemblingError {
    private message: string;

    constructor(message: string) {
        this.message = message;
    }

    toString(): string {
        return this.message;
    }
}

class Assembler {
    tokens: string[];
    current: string | null = null;
    result = 0;

    // There can only be one read or write and one goto.
    seenReadWrite = false;
    seenGoto = false;
    busA: Register | null = null;
    busB: Register | null = null;

    constructor(instruction: string) {
        this.tokens = instruction.split(/\s+|;/);
        this.current = this.nextToken();
    }

    private nextToken(): string | null {
        const last = this.tokens.shift();
        if (last === undefined) {
            return null;
        } else {
            return last;
        }
    }

    private tryParseReadWrite(): void {
        if (this.seenReadWrite) {
            throw new AssemblingError('Only one read/write permitted');
        }
        this.seenReadWrite = true;
        if (this.current === 'rd') {
            this.result |= 0x0060_0000;
        } else {
            this.result |= 0x0020_0000;
        }
        this.current = this.nextToken();
    }

    private tryParseGoto(): void {
        if (this.seenGoto) {
            throw new AssemblingError('Only one goto permitted.');
        }
        this.seenGoto = true;
        if (this.current === 'if') {
            // Conditional jump
            this.current = this.nextToken();
            if (this.current === 'N') {
                this.result |= 0x2000_0000;
            } else if (this.current === 'Z') {
                this.result |= 0x4000_0000;
            } else {
                throw new AssemblingError('Invalid jump statement!');
            }
            this.current = this.nextToken();
        } else {
            // Unconditional jump
            this.result |= 0x6000_0000;
        }
        if (this.current !== 'goto') {
            throw new AssemblingError('Invalid jump statement!');
        }
        this.current = this.nextToken();
        if (this.current === null) {
            throw new AssemblingError('Invalid jump statement!');
        }
        const jumpAddress = parseInt(this.current);
        if (jumpAddress < 0 || jumpAddress > 255) {
            throw new AssemblingError(
                'Jump address must be between 0 and 255.'
            );
        }
        this.result |= jumpAddress;
    }

    private tryParseRegisterUse(): void {
        if (!isRegister(this.current!) && !isMemoryBuffer(this.current!)) {
            throw new AssemblingError('Unidentifiable register name');
        }
        const register = this.current;
        this.current = this.nextToken();
        if (this.current === '<-') {
            // This is an assignment to a register.
            this.current = this.nextToken();
        } else {
            if (!isRegister(register)) this.busA = registerFromString(register);
            return true;
        }
        return false;
    }

    public parse(): AssemblingError | number {
        while (this.current !== null) {
            try {
                if (this.current === 'goto' || this.current === 'if') {
                    this.tryParseGoto();
                } else if (this.current === 'rd' || this.current === 'wr') {
                    this.tryParseReadWrite();
                } else {
                    this.tryParseRegisterUse();
                }
            } catch (e) {
                // @ts-ignore
                return e;
            }
        }
        return this.result;
    }
}

export function assembleLine(line: string): number | AssemblingError {
    const assembler = new Assembler(line);
    return assembler.parse();
}
