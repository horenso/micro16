import { Result, Ok, Err } from './types';

class Lexer {
    private result: string[] = [];

    constructor(private line: string) {}

    public lex(): Result<string[]> {
        loop: for (let i = 0; i < this.line.length; ) {
            const rest = this.line.slice(i);
            const whitespacesMatch = rest.match(/\s|;+/);
            // Ignore whitespaces and semicolons
            if (whitespacesMatch !== null) {
                i += whitespacesMatch[0].length;
                continue;
            }
            if (rest.match(/-1|\(-1\)/)) {
                this.result.push('MINUS_ONE');
                ++i;
                continue;
            }
            if (rest.startsWith('0')) {
                this.result.push('ZERO');
                ++i;
                continue;
            }
            if (rest.startsWith('1')) {
                this.result.push('ONE');
                ++i;
                continue;
            }
            if (rest.startsWith('(') || rest.startsWith(')')) {
                this.result.push(rest[0]);
                ++i;
                continue;
            }
            const locationMatch = rest.match(/\w+\d*/);
            if (locationMatch !== null) {
                i += locationMatch[0].length;
                continue;
            }
            return Err(`Invalid line: ${rest}`);
        }
        return Ok(this.result);
    }
}

export function lex(line: string): Result<string[]> {
    const lexer = new Lexer(line);
    return lexer.lex();
}
