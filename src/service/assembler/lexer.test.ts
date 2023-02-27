import { Result, Ok, Token } from './types';
import { expect, test } from 'vitest';
import { lex } from './lexer';

test('Basic addition of two registers.', () => {
    const input = 'R1 <- R2 + R3; rd';
    const expected: Result<Token[]> = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'R2',
        },
        { type: 'BINARY_OPERATOR', operator: '+' },
        {
            type: 'LOCATION',
            location: 'R3',
        },
        {
            type: 'READ_WRITE',
            readWrite: 'rd',
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});

test('Parentheses with shift.', () => {
    const input = 'R1 <- lsh(1+(-1))';
    const expected: Result<Token[]> = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
        },
        {
            type: 'ARROW',
        },
        {
            type: 'FUNCTION',
            name: 'lsh',
        },
        {
            type: 'L_PAREN',
        },
        {
            type: 'LOCATION',
            location: 'ONE',
        },
        {
            type: 'BINARY_OPERATOR',
            operator: '+',
        },
        {
            type: 'LOCATION',
            location: 'MINUS_ONE',
        },
        {
            type: 'R_PAREN',
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});

test('1 vs ONE 0 vs ZERO', () => {
    // NOTE: This is just a lexer test, this wouldn't be a valid instruction.
    const input = 'R1 <- 0 + 1; goto 0; if N goto 1; R1 <- 1; wr';
    const expected: Result<Token[]> = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'ZERO',
        },
        { type: 'BINARY_OPERATOR', operator: '+' },
        {
            type: 'LOCATION',
            location: 'ONE',
        },
        { type: 'GOTO' },
        { type: 'JUMP_ADDRESS', number: 0 },
        { type: 'IF' },
        { type: 'CONDITION', condition: 'N' },
        { type: 'GOTO' },
        { type: 'JUMP_ADDRESS', number: 1 },
        {
            type: 'LOCATION',
            location: 'R1',
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'ONE',
        },
        {
            type: 'READ_WRITE',
            readWrite: 'wr',
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});
