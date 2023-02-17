import { Assembler } from './assembler/assembler';
import { Result } from './assembler/types';
import { parseLine } from './assembler/parser';
import { Err } from './assembler/types';

export function assembleLine(line: string): Result<number> {
    const paredLine = parseLine(line);
    console.log('parseLine result:', JSON.stringify(paredLine));
    if (!paredLine.ok) {
        return paredLine;
    }
    return Err(JSON.stringify(paredLine.result));
    // if (paredLine.ok) {
    //     const assembler = new Assembler(paredLine.result);
    //     // return assembler.assemble();
    // } else {
    //     return paredLine;
    // }
}
