import { parse } from './parser';
import { expect, test } from 'vitest';
import { Result, ParsedInstruction, Ok } from './types';

test('Simple addition', () => {
    const instruction = 'R1 <- R2 + R3';
    const expected: Result<ParsedInstruction> = Ok({
        statements: [
            {
                dest: 'R1',
                left: 'R2',
                right: 'R3',
                operator: '+',
            },
        ],
    });
    expect(parse(instruction)).toMatchObject(expected);
});

test('Multiple statements', () => {
    const instruction = 'MAR<-R6; MBR<-R8; R1<-R8';
    const expected: Result<ParsedInstruction> = Ok({
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
    });
    expect(parse(instruction)).toMatchObject(expected);
});

test('Using constants', () => {
    // NOTE: Of course this wouldn't be able to assemble into one
    // instruction, but it should be able to parse.
    const instruction = 'R1 <- 1 + 1; R2 <- R3 & R4; R5; MBR';
    const expected: Result<ParsedInstruction> = Ok({
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
    });
    expect(parse(instruction)).toMatchObject(expected);
});
