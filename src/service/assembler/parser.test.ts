import { parseLine } from './parser';
import { expect, test } from 'vitest';
import { ParsingResult } from './types';

test('Multiple statements', () => {
    const instruction = 'MAR<-R6; MBR<-R8; R1<-R8';
    const expected: ParsingResult = {
        ok: true,
        instruction: {
            statements: [
                {
                    dest: 'MAR',
                    left: 'R6',
                },
                {
                    dest: 'MBR',
                    left: 'R8',
                },
                {
                    dest: 'R1',
                    left: 'R8',
                },
            ],
        },
    };
    expect(parseLine(instruction)).toMatchObject(expected);
});

test('Using constants', () => {
    // NOTE: Of course this wouldn't be able to assemble into one
    // instruction, but it should be able to parse.
    const instruction = 'R1 <- 1 + 1; R2 <- R3 & R4; R5; MBR';
    const expected: ParsingResult = {
        ok: true,
        instruction: {
            statements: [
                {
                    dest: 'R1',
                    left: 'ONE',
                    right: 'ONE',
                    operator: '+',
                },
                {
                    dest: 'R2',
                    left: 'R3',
                    right: 'R4',
                    operator: '&',
                },
                {
                    left: 'R5',
                },
                {
                    left: 'MBR',
                },
            ],
        },
    };
    expect(parseLine(instruction)).toMatchObject(expected);
});
