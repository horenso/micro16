import { assemble } from './assembler/assembler';
import { Ok, Result } from './assembler/types';
import { parse } from './assembler/parser';
import { lex } from './assembler/lexer';
import { analyze } from './assembler/analyzer';

export function assembleLine(line: string): Result<number> {
    const lexResult = lex(line);
    if (!lexResult.ok) {
        return lexResult;
    }
    console.log('Tokens');
    console.table(lexResult.result);
    const parseResult = parse(lexResult.result);
    if (!parseResult.ok) {
        return parseResult;
    }
    console.log('Parsed Statement');
    console.log(parseResult.result);
    const analyzedResult = analyze(parseResult.result);
    if (!analyzedResult.ok) {
        return analyzedResult;
    }
    console.log('analyzed Statement:', analyzedResult.result);
    return Ok(assemble(analyzedResult.result));
}
