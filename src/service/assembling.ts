import { Assembler } from './assembler/assembler';
import { AssemblingResult } from './assembler/types';
import { parseLine } from './assembler/parser';

export function assembleLine(line: string): AssemblingResult {
    const paredLine = parseLine(line);
    if (paredLine.ok) {
        const assembler = new Assembler(paredLine.instruction);
        return assembler.assemble();
    } else {
        return paredLine;
    }
}
