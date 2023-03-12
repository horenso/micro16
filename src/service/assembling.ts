import { Ok, Result } from '@/service/result-type';
import { assemble } from '@/service/assembler/assembler';
import { parse } from '@/service/assembler/parser';
import { lex } from '@/service/assembler/lexer';
import { analyze } from '@/service/assembler/analyzer';
import {
    resolveDefinitionLabel,
    resolveTargetLabels,
} from '@/service/assembler/label-resolver';
import { Token } from './assembler/token';

const mode = import.meta.env.MODE;

export function assembleCode(code: string[]): Result<number[]> {
    const lexedLines: Token[][] = [];
    for (let line of code) {
        const lexResult = lex(line);
        if (!lexResult.ok) {
            return lexResult;
        }
        if (mode !== 'production') {
            console.log('Tokens');
            console.table(lexResult.result);
        }
        lexedLines.push(lexResult.result);
    }

    const labels = new Map<string, number>();
    for (let [lineNumber, tokens] of lexedLines.entries()) {
        resolveDefinitionLabel(tokens, lineNumber, labels);
    }

    const result: number[] = [];
    for (const tokens of lexedLines) {
        const resolveResult = resolveTargetLabels(tokens, labels);
        if (!resolveResult.ok) {
            return resolveResult;
        }

        const parseResult = parse(tokens);
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
        result.push(assemble(analyzedResult.result));
    }
    return Ok(result);
}
