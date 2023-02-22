import { assemble } from './assembler/assembler';
import { Ok, Result } from './assembler/types';
import { parse } from './assembler/parser';
import { lex } from './assembler/lexer';
import { analyse } from './assembler/analyser';

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
    const analyseResult = analyse(parseResult.result);
    if (!analyseResult.ok) {
        return analyseResult;
    }
    console.log('Analysed Statement:', analyseResult.result);
    return Ok(assemble(analyseResult.result));
}
