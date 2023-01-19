import { REGISTER_NAMES } from '../stores/registers';

export class ParseError {
    private message: string;

    constructor(message: string) {
        this.message = message;
    }

    toString(): string {
        return this.message;
    }
}

export function assembleLine(line: string): ParseError | number {
    if (line === '') {
        return 0;
    }
    let result = 0;

    // Booleans for things that can only occur once per instruction:
    let seenReadWrite = false;
    let seenGoto = false;
    let seenCalculation = false;

    let tokens = line.split(/\s+|;/);
    console.log('Tokens:', tokens);
    for (
        let currentToken = tokens.shift();
        currentToken !== undefined;
        currentToken = tokens.shift()
    ) {
        if (currentToken === ';') {
            continue; // Ignore for now.
        }
        if (currentToken === 'rd' || currentToken === 'wr') {
            if (seenReadWrite) {
                return new ParseError('Only one read/write permitted');
            }
            seenReadWrite = true;
            if (currentToken === 'rd') {
                result |= 0x600000;
            } else {
                result |= 0x200000;
            }
        }
        if (currentToken === 'goto' || currentToken === 'if') {
            if (seenGoto) {
                return new ParseError('Only one goto permitted.');
            }
            seenGoto = true;
            const resultOrError = parseJump(result, currentToken, tokens);
            if (resultOrError instanceof ParseError) {
                return resultOrError;
            } else {
                result = resultOrError;
            }
        }
        if (REGISTER_NAMES.includes(currentToken)) {
            if (seenCalculation) {
                return new ParseError('Only one calculation permitted.');
            }
            const resultOrError = parseCalculation(
                result,
                currentToken,
                tokens
            );
            if (resultOrError instanceof ParseError) {
                return resultOrError;
            } else {
                result |= resultOrError;
            }
        }
    }
    console.log(result);
    return result;
}

function parseJump(
    result: number,
    currentToken: string,
    tokens: string[]
): number | ParseError {
    if (currentToken === 'if') {
        // Conditional jump
        let maybeToken = tokens.shift();
        if (maybeToken === 'N') {
            result |= 0x20000000;
        } else if (maybeToken === 'Z') {
            result |= 0x40000000;
        } else {
            return new ParseError('Invalid jump statement!');
        }
        maybeToken = tokens.shift();
        if (maybeToken === undefined) {
            return new ParseError('Invalid jump statement!');
        }
        currentToken = maybeToken;
    } else {
        // Unconditional jump
        result |= 0x60000000;
    }
    if (currentToken !== 'goto') {
        return new ParseError('Invalid jump statement!');
    }
    let maybeToken = tokens.shift();
    if (maybeToken === undefined) {
        return new ParseError('Invalid jump statement!');
    }
    currentToken = maybeToken;
    if (currentToken === undefined) {
        return new ParseError('Invalid jump statement!');
    }
    const jumpAddress = parseInt(currentToken);
    if (jumpAddress < 0 || jumpAddress > 255) {
        return new ParseError('Jump address must be between 0 and 255.');
    }
    result |= jumpAddress;
    return result;
}

function parseCalculation(
    result: number,
    currentToken: string,
    tokens: string[]
): number | ParseError {
    const targetRegister = REGISTER_NAMES.indexOf(currentToken);
    result |= targetRegister << 16;
    return result;
}
