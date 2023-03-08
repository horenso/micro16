import { Ok, Result } from '@/service/result-type';
import { assemble } from '@/service/assembler/assembler';
import { parse } from '@/service/assembler/parser';
import { lex } from '@/service/assembler/lexer';
import { analyze } from '@/service/assembler/analyzer';

export function assembleLine(line: string): Result<number> {
    const mode = import.meta.env.MODE;
    const lexResult = lex(line);
    if (!lexResult.ok) {
        return lexResult;
    }
    if (mode !== 'production') {
        console.log('Tokens');
        console.table(lexResult.result);
    }
    const parseResult = parse(lexResult.result);
    if (!parseResult.ok) {
        return parseResult;
    }
    if (mode !== 'production') {
        console.log('Parsed Statement');
        console.log(parseResult.result);
    }
    const analyzedResult = analyze(parseResult.result);
    if (!analyzedResult.ok) {
        return analyzedResult;
    }
    if (mode !== 'production') {
        console.log('Analyzed Statement');
        console.log(analyzedResult.result);
    }
    return Ok(assemble(analyzedResult.result));
}
