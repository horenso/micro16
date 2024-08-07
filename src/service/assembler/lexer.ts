import { isLocation } from '@/service/registers';
import { Result, Ok, Err } from '@/service/result-type';
import { Token } from './token';

export function lex(line: string): Result<Token[]> {
    return new Lexer(line, false).lex();
}

export function lexNeverFail(line: string): Token[] {
    const result = new Lexer(line, true).lex();
    if (!result.ok) {
        return [];
    }
    return result.result;
}

class Lexer {
    private result: Token[] = [];

    constructor(
        private line: string,
        private verboseAndNeverFail: boolean
    ) {}

    private advance(amount: number) {
        this.line = this.line.slice(amount);
    }

    private getPreviousToken(): Token | undefined {
        for (let i = this.result.length - 1; i >= 0; --i) {
            const token = this.result[i];
            if (token.type !== 'WHITESPACE') {
                return token;
            }
        }
        return undefined;
    }

    private ignoreWhitespace(): boolean {
        const whitespaceMatch = this.line.match(/^(\s|;+)/);
        // Ignore whitespace and semicolons
        if (whitespaceMatch !== null) {
            const match = whitespaceMatch[0];
            if (this.verboseAndNeverFail) {
                this.result.push({ type: 'WHITESPACE', text: match });
            }
            this.advance(match.length);
            return true;
        }
        return false;
    }

    private matchPositiveNumber(): boolean {
        const numberMatch = this.line.match(/^\d+/);
        if (numberMatch === null) {
            return false;
        }
        const match = numberMatch[0];

        if (match === '0' || match === '1') {
            // This could arguably be done in the Parser,
            // but since it's so simple we'll do it here.
            // '0' or '1' are locations expect when
            // the previous token is 'goto', then
            // they are jump addresses.
            const previousToken = this.getPreviousToken();
            if (previousToken?.type !== 'GOTO') {
                if (match === '0') {
                    this.result.push({
                        type: 'LOCATION',
                        location: 'ZERO',
                        text: match,
                    });
                } else {
                    this.result.push({
                        type: 'LOCATION',
                        location: 'ONE',
                        text: match,
                    });
                }
                this.advance(match.length);
                return true;
            }
        }
        const address = parseInt(match, 10);
        if (address > 255) {
            return false;
        }
        this.result.push({
            type: 'JUMP_ADDRESS',
            number: address,
            text: match,
        });
        this.advance(match.length);
        return true;
    }

    private matchLabel(): boolean {
        const labelMatch = this.line.match(/^(:|\.)(\w+)/);
        if (labelMatch === null) {
            return false;
        }
        const match = labelMatch[0];
        const labelText = labelMatch[2];
        if (labelText.match(/^[a-zA-Z]/) === null) {
            return false;
            // TODO: The structure right now doesn't allow me
            //       to propagate the error "label start must be alphanumeric"
        }
        const labelType = labelMatch[1].startsWith(':')
            ? 'LABEL_DEFINE'
            : 'LABEL_TARGET';
        this.result.push({
            type: labelType,
            label: labelText,
            text: match,
        });
        this.advance(match.length);
        return true;
    }

    private matchLocationOrFunction(): boolean {
        // -1 is only ever a register location, whereas
        // '1' could be a jump address or a operand.
        const minusOneMatch = this.line.match(/^-1/);
        if (minusOneMatch !== null) {
            const match = minusOneMatch[0];
            this.result.push({
                type: 'LOCATION',
                location: 'MINUS_ONE',
                text: match,
            });
            this.advance(match.length);
            return true;
        }
        const matchWord = this.line.match(/^(\w+\d*)/);
        if (matchWord !== null) {
            const match = matchWord[0];
            if (isLocation(match)) {
                this.result.push({
                    type: 'LOCATION',
                    location: match,
                    text: match,
                });
                this.advance(matchWord[0].length);
                return true;
            } else if (match === 'rsh' || match === 'lsh') {
                this.result.push({
                    type: 'FUNCTION',
                    name: match,
                    text: match,
                });
                this.advance(matchWord[0].length);
                return true;
            }
        }
        return false;
    }

    private matchExact(value: string, result: Token): boolean {
        if (this.line.startsWith(value)) {
            this.result.push(result);
            this.line = this.line.slice(value.length);
            return true;
        }
        return false;
    }

    public lex(): Result<Token[]> {
        while (this.line.length > 0) {
            if (this.line.startsWith('#')) {
                // Start of comment.
                if (this.verboseAndNeverFail) {
                    this.result.push({ type: 'COMMENT', text: this.line });
                }
                return Ok(this.result);
            }
            let matched =
                this.ignoreWhitespace() ||
                this.matchLocationOrFunction() ||
                this.matchPositiveNumber() ||
                this.matchLabel() ||
                this.matchExact('wr', {
                    type: 'READ_WRITE',
                    readWrite: 'wr',
                    text: 'wr',
                }) ||
                this.matchExact('rd', {
                    type: 'READ_WRITE',
                    readWrite: 'rd',
                    text: 'rd',
                }) ||
                this.matchExact('(', { type: 'L_PAREN', text: '(' }) ||
                this.matchExact(')', { type: 'R_PAREN', text: ')' }) ||
                this.matchExact('<-', { type: 'ARROW', text: '<-' }) ||
                this.matchExact('goto', { type: 'GOTO', text: 'goto' }) ||
                this.matchExact('if', { type: 'IF', text: 'if' }) ||
                this.matchExact('N', {
                    type: 'CONDITION',
                    condition: 'N',
                    text: 'N',
                }) ||
                this.matchExact('Z', {
                    type: 'CONDITION',
                    condition: 'Z',
                    text: 'Z',
                }) ||
                this.matchExact('~', {
                    type: 'UNARY_OPERATOR',
                    operator: '~',
                    text: '~',
                }) ||
                this.matchExact('+', {
                    type: 'BINARY_OPERATOR',
                    operator: '+',
                    text: '+',
                }) ||
                this.matchExact('&', {
                    type: 'BINARY_OPERATOR',
                    operator: '&',
                    text: '&',
                });
            if (!matched) {
                if (this.verboseAndNeverFail) {
                    this.result.push({ type: 'GARBAGE', text: this.line });
                    return Ok(this.result);
                } else {
                    return Err(`Invalid token '${this.line}'.`);
                }
            }
        }
        return Ok(this.result);
    }
}
