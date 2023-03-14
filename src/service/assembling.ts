import { Err, Failure, Ok, Result } from '@/service/result-type';
import { assemble } from '@/service/assembler/assembler';
import { parse } from '@/service/assembler/parser';
import { lex } from '@/service/assembler/lexer';
import { analyze } from '@/service/assembler/analyzer';
import {
    resolveDefinitionLabel,
    resolveTargetLabels,
} from '@/service/assembler/label-resolver';
import { Token } from './assembler/token';
import { log, logTable } from '@/service/logging';

function errorWithLineNumber<T>(
    error: Failure<T>,
    lineNumber: number
): Failure<T> {
    error.errorMessage = `Line ${lineNumber}: ${error.errorMessage}`;
    return error;
}

export function assembleCode(code: string[]): Result<number[]> {
    const lexedLines: Token[][] = [];
    for (const [lineNumber, line] of code.entries()) {
        const lexResult = lex(line);
        if (!lexResult.ok) {
            return errorWithLineNumber(lexResult, lineNumber);
        }
        log('Tokens');
        logTable(lexResult.result);
        lexedLines.push(lexResult.result);
    }

    const labels = new Map<string, number>();
    for (const [lineNumber, tokens] of lexedLines.entries()) {
        const defineResult = resolveDefinitionLabel(tokens, lineNumber, labels);
        if (!defineResult.ok) {
            return errorWithLineNumber(defineResult, lineNumber);
        }
    }

    const result: number[] = [];
    for (const [lineNumber, tokens] of lexedLines.entries()) {
        const resolveResult = resolveTargetLabels(tokens, labels);
        if (!resolveResult.ok) {
            return errorWithLineNumber(resolveResult, lineNumber);
        }

        const parseResult = parse(tokens);
        if (!parseResult.ok) {
            return errorWithLineNumber(parseResult, lineNumber);
        }
        log('Parsed Statement');
        log(parseResult.result);

        const analyzedResult = analyze(parseResult.result);
        if (!analyzedResult.ok) {
            return errorWithLineNumber(analyzedResult, lineNumber);
        }
        log('Analyzed Statement');
        log(analyzedResult.result);

        result.push(assemble(analyzedResult.result));
    }
    return Ok(result);
}
