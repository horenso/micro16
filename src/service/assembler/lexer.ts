import { Result, Ok, Err } from './types';

class Lexer {
    private result: string[] = [];

    constructor(private line: string) {}

    private ignoreWhitespace(): boolean {
        const whitespacesMatch = this.line.match(/^(\s|;+)/);
        // Ignore whitespaces and semicolons
        if (whitespacesMatch !== null) {
            this.line = this.line.slice(whitespacesMatch[0].length);
            return true;
        }
        return false;
    }

    private matchOne(char: string, result?: string): boolean {
        if (this.line.startsWith(char)) {
            if (result !== undefined) {
                this.result.push(result);
            } else {
                this.result.push(char);
            }
            this.line = this.line.slice(1);
            return true;
        }
        return false;
    }

    private matchRegex(reg: RegExp, result?: string): boolean {
        const match = this.line.match(reg);
        if (match !== null) {
            if (result !== undefined) {
                this.result.push(result);
            } else {
                this.result.push(match[0]);
            }
            this.line = this.line.slice(match[0].length);
            return true;
        }
        return false;
    }

    public lex(): Result<string[]> {
        loop: while (this.line.length > 0) {
            let matched =
                this.ignoreWhitespace() ||
                this.matchRegex(/^(-1|\(\s*-1\s*\))/, 'MINUS_ONE') ||
                this.matchOne('0', 'ZERO') ||
                this.matchOne('1', 'ONE') ||
                this.matchOne('(') ||
                this.matchOne(')') ||
                this.matchRegex(/^(<-)/) ||
                this.matchRegex(/^(\+|-|&)/) ||
                this.matchRegex(/^(\w+\d*)/);
            if (!matched) {
                return Err(`Invalid from: ${this.line}`);
            }
        }
        return Ok(this.result);
    }
}

export function lex(line: string): Result<string[]> {
    const lexer = new Lexer(line);
    return lexer.lex();
}
