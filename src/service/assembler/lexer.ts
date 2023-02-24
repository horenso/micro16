import { isLocation, isReadable, isWritable } from '../registers';
import { Result, Ok, Err, Token, Operator } from './types';

export function lex(line: string): Result<Token[]> {
    return new Lexer(line).lex();
}

class Lexer {
    private result: Token[] = [];

    constructor(private line: string) {}

    private advance(amount: number) {
        this.line = this.line.slice(amount);
    }

    private ignoreWhitespace(): boolean {
        const whitespaceMatch = this.line.match(/^(\s|;+)/);
        // Ignore whitespace and semicolons
        if (whitespaceMatch !== null) {
            this.line = this.line.slice(whitespaceMatch[0].length);
            return true;
        }
        return false;
    }

    private matchPositiveNumber(): boolean {
        const numberMatch = this.line.match(/^\d+/);
        const previousToken: Token | undefined =
            this.result.length > 0
                ? this.result[this.result.length - 1]
                : undefined;
        if (numberMatch === null) {
            return false;
        }
        const match = numberMatch[0];

        // This could arguably be done in the Parser,
        // but since it's so simple we'll do it here.
        // '0' or '1' are locations expect when
        // the previous token is 'goto', then
        // they are jump addresses.
        if (
            (match === '0' || match === '1') &&
            previousToken?.type === 'GOTO'
        ) {
            this.result.push({
                type: 'NUMBER',
                number: parseInt(match, 10),
            });
        } else {
            if (match === '0') {
                this.result.push({
                    type: 'LOCATION',
                    location: 'ZERO',
                    readable: true,
                    writable: false,
                });
            } else {
                this.result.push({
                    type: 'LOCATION',
                    location: 'ONE',
                    readable: true,
                    writable: false,
                });
            }
        }
        this.advance(match.length);
        return true;
    }

    private matchOperator(): boolean {
        const operatorMatch = this.line.match(/^(\+|-|&)/);
        if (operatorMatch !== null) {
            const match = operatorMatch[0] as Operator;
            this.result.push({ type: 'OPERATOR', operator: match });
            this.advance(operatorMatch[0].length);
            return true;
        }
        return false;
    }

    private matchLocationOrFunction(): boolean {
        // (-1) is only ever a register location, whereas
        // '1' could be a jump address or a operand.
        const minusOneMatch = this.line.match(/^(-1|\(\s*-1\s*\))/);
        if (minusOneMatch !== null) {
            this.result.push({
                type: 'LOCATION',
                location: 'MINUS_ONE',
                readable: true,
                writable: false,
            });
            this.advance(minusOneMatch[0].length);
            return true;
        }
        const matchWord = this.line.match(/^(\w+\d*)/);
        if (matchWord !== null) {
            const match = matchWord[0];
            if (isLocation(match)) {
                this.result.push({
                    type: 'LOCATION',
                    location: match,
                    readable: isReadable(match),
                    writable: isWritable(match),
                });
                this.advance(matchWord[0].length);
                return true;
            } else if (match === 'rsh' || match === 'lsh') {
                this.result.push({ type: 'FUNCTION', name: match });
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
            let matched =
                this.ignoreWhitespace() ||
                this.matchLocationOrFunction() ||
                this.matchPositiveNumber() ||
                this.matchExact('wr', {
                    type: 'READ_WRITE',
                    readWrite: 'wr',
                }) ||
                this.matchExact('rd', {
                    type: 'READ_WRITE',
                    readWrite: 'rd',
                }) ||
                this.matchExact('(', { type: 'L_PAREN' }) ||
                this.matchExact(')', { type: 'R_PAREN' }) ||
                this.matchExact('<-', { type: 'ARROW' }) ||
                this.matchExact('goto', { type: 'GOTO' }) ||
                this.matchExact('if', { type: 'IF' }) ||
                this.matchExact('N', { type: 'CONDITION', condition: 'N' }) ||
                this.matchExact('Z', { type: 'CONDITION', condition: 'Z' }) ||
                this.matchOperator();
            if (!matched) {
                return Err(`Invalid from: ${this.line}.`);
            }
        }
        return Ok(this.result);
    }
}
