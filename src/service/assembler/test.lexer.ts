import { expect, test } from 'vitest';
import { Result, Ok } from '@/service/result-type';
import { lex } from './lexer';
import { Token } from './token';

function testLexSuccess(input: string, expected: Token[]): void {
    expect(lex(input)).toMatchObject(Ok(expected));
}

function testLexFail(input: string): void {
    expect(lex(input)).toMatchObject({ ok: false });
}

test('1+1', () => {
    const input = '1 + 1';
    const expected: Token[] = [
        {
            type: 'LOCATION',
            location: 'ONE',
            text: '1',
        },
        { type: 'BINARY_OPERATOR', operator: '+', text: '+' },
        {
            type: 'LOCATION',
            location: 'ONE',
            text: '1',
        },
    ];
    testLexSuccess(input, expected);
});

test('goto 1', () => {
    const input = 'goto 1';
    const expected: Token[] = [
        {
            type: 'GOTO',
            text: 'goto',
        },
        { type: 'JUMP_ADDRESS', number: 1, text: '1' },
    ];
    testLexSuccess(input, expected);
});

test('Basic addition of two registers.', () => {
    const input = 'R1 <- R2 + R3; rd';
    const expected: Token[] = [
        {
            type: 'LOCATION',
            location: 'R1',
            text: 'R1',
        },
        { type: 'ARROW', text: '<-' },
        {
            type: 'LOCATION',
            location: 'R2',
            text: 'R2',
        },
        { type: 'BINARY_OPERATOR', operator: '+', text: '+' },
        {
            type: 'LOCATION',
            location: 'R3',
            text: 'R3',
        },
        {
            type: 'READ_WRITE',
            readWrite: 'rd',
            text: 'rd',
        },
    ];
    testLexSuccess(input, expected);
});

test('Parentheses with shift.', () => {
    const input = 'R1 <- lsh(1+(-1))';
    const expected: Token[] = [
        {
            type: 'LOCATION',
            location: 'R1',
            text: 'R1',
        },
        {
            type: 'ARROW',
            text: '<-',
        },
        {
            type: 'FUNCTION',
            name: 'lsh',
            text: 'lsh',
        },
        {
            type: 'L_PAREN',
            text: '(',
        },
        {
            type: 'LOCATION',
            location: 'ONE',
            text: '1',
        },
        {
            type: 'BINARY_OPERATOR',
            operator: '+',
            text: '+',
        },
        {
            type: 'LOCATION',
            location: 'MINUS_ONE',
            text: '(-1)',
        },
        {
            type: 'R_PAREN',
            text: ')',
        },
    ];
    testLexSuccess(input, expected);
});

test('1 vs ONE 0 vs ZERO', () => {
    // NOTE: This is just a lexer test, this wouldn't be a valid instruction.
    const input = 'R1 <- 0 + 1; goto 0; if N goto 1; R1 <- 1; wr';
    const expected: Token[] = [
        {
            type: 'LOCATION',
            location: 'R1',
            text: 'R1',
        },
        { type: 'ARROW', text: '<-' },
        {
            type: 'LOCATION',
            location: 'ZERO',
            text: '0',
        },
        { type: 'BINARY_OPERATOR', operator: '+', text: '+' },
        {
            type: 'LOCATION',
            location: 'ONE',
            text: '1',
        },
        { type: 'GOTO', text: 'goto' },
        { type: 'JUMP_ADDRESS', number: 0, text: '0' },
        { type: 'IF', text: 'if' },
        { type: 'CONDITION', condition: 'N', text: 'N' },
        { type: 'GOTO', text: 'goto' },
        { type: 'JUMP_ADDRESS', number: 1, text: '1' },
        {
            type: 'LOCATION',
            location: 'R1',
            text: 'R1',
        },
        { type: 'ARROW', text: '<-' },
        {
            type: 'LOCATION',
            location: 'ONE',
            text: '1',
        },
        {
            type: 'READ_WRITE',
            readWrite: 'wr',
            text: 'wr',
        },
    ];
    testLexSuccess(input, expected);
});

test('Labels', () => {
    let input = ':HELLO';
    let expected: Token[] = [
        { type: 'LABEL_DEFINE', label: 'HELLO', text: ':HELLO' },
    ];
    testLexSuccess(input, expected);

    input = 'if Z goto .HELLO';
    expected = [
        { type: 'IF', text: 'if' },
        { type: 'CONDITION', condition: 'Z', text: 'Z' },
        { type: 'GOTO', text: 'goto' },
        { type: 'LABEL_TARGET', label: 'HELLO', text: '.HELLO' },
    ];
    testLexSuccess(input, expected);

    // Label cannot start with a number
    testLexFail(':32');
    testLexFail('.32');
});
