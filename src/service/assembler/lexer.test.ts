import { Result, Ok, Err, Token, Operator } from './types';
import { expect, test } from 'vitest';
import { lex } from './lexer';

test('Basic addition of two registers.', () => {
    const input = 'R1 <- R2 + R3';
    const expected = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
            readable: true,
            writable: true,
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'R2',
            readable: true,
            writable: true,
        },
        { type: 'OPERATOR', operator: '+' },
        {
            type: 'LOCATION',
            location: 'R3',
            readable: true,
            writable: true,
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});

test('Parentheses with shift.', () => {
    const input = 'R1 <- lsh(1+(-1))';
    const expected = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
            readable: true,
            writable: true,
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
            readable: true,
            writable: false,
        },
        {
            type: 'OPERATOR',
            operator: '+',
        },
        {
            type: 'LOCATION',
            location: 'MINUS_ONE',
            readable: true,
            writable: false,
        },
        {
            type: 'R_PAREN',
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});

test('1 vs ONE 0 vs ZERO', () => {
    // NOTE: This is just a lexer test, this wouldn't be a valid instruction.
    const input = 'R1 <- 0 + 1; goto 0; if N goto 1; R1 <- 1';
    const expected: Result<Token[]> = Ok([
        {
            type: 'LOCATION',
            location: 'R1',
            readable: true,
            writable: true,
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'ZERO',
            readable: true,
            writable: false,
        },
        { type: 'OPERATOR', operator: '+' },
        {
            type: 'LOCATION',
            location: 'ONE',
            readable: true,
            writable: false,
        },
        { type: 'GOTO' },
        { type: 'NUMBER', number: 0 },
        { type: 'IF' },
        { type: 'CONDITION', condition: 'N' },
        { type: 'GOTO' },
        { type: 'NUMBER', number: 1 },
        {
            type: 'LOCATION',
            location: 'R1',
            readable: true,
            writable: true,
        },
        { type: 'ARROW' },
        {
            type: 'LOCATION',
            location: 'ONE',
            readable: true,
            writable: false,
        },
    ]);
    expect(lex(input)).toMatchObject(expected);
});
