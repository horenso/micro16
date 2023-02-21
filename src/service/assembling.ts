import { Assembler } from './assembler/assembler';
import { Result } from './assembler/types';
import { parseLine } from './assembler/parser';
import { lex } from './assembler/lexer';

export function assembleLine(line: string): Result<number> {
    const paredLine = parseLine(line);
    console.log('Tokens:', lex(line));
    console.log('Statement:', JSON.stringify(paredLine));
    if (!paredLine.ok) {
        return paredLine;
    }
    const assembler = new Assembler(paredLine.result);
    return assembler.assemble();
}
