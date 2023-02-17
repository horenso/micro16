import { isLocation, isReadable, isWritable } from '../registers';

import {
    Err,
    Expression,
    isOperator,
    Jump,
    Ok,
    Operation,
    ParsedInstruction,
    Result,
    Shift,
    Statement,
} from './types';
import { lex } from './lexer';

export function parseLine(line: string): Result<ParsedInstruction> {
    const lexResult = lex(line);
    if (!lexResult.ok) {
        return lexResult;
    }
    console.log('Tokens where:', lexResult.result);
    const parser = new Parser(lexResult.result);
    return parser.parse();
}

class Parser {
    tokens: string[];
    current_token?: string;

    seenReadWrite = false;
    seenGoto = false;

    result: ParsedInstruction = {
        statements: [],
    };

    error: Error | undefined;

    constructor(tokens: string[]) {
        this.tokens = tokens;
        this.current_token = this.nextToken();
    }

    private peekToken(): string | undefined {
        return this.tokens[0];
    }

    private nextToken(): string | undefined {
        return this.tokens.shift();
    }

    private parseReadWrite(current_token: 'rd' | 'wr'): Result<{}> {
        if (this.seenReadWrite) {
            return Err('Only one read/write permitted');
        }
        this.seenReadWrite = true;
        this.result.readWrite = current_token;
        this.current_token = this.nextToken();
        return Ok({});
    }

    private parseJump(): Result<Jump> {
        if (this.seenGoto) {
            return Err('Only one goto permitted.');
        }
        this.seenGoto = true;
        let condition: 'N' | 'Z' | undefined;
        if (this.current_token === 'if') {
            this.current_token = this.nextToken();
            if (this.current_token !== 'N' && this.current_token !== 'Z') {
                return Err('Invalid jump statement!');
            }
            condition = this.current_token;
            this.current_token = this.nextToken();
        }
        if (this.current_token !== 'goto') {
            return Err('Invalid jump statement!');
        }
        this.current_token = this.nextToken();
        if (this.current_token === undefined) {
            return Err('Invalid jump statement!');
        }
        const jumpAddress = parseInt(this.current_token);
        if (jumpAddress < 0 || jumpAddress > 255) {
            return Err('Jump address must be between 0 and 255.');
        }
        this.current_token = this.nextToken();
        return Ok({ condition: condition, toAddress: jumpAddress });
    }

    // Operation is either only a left-hand side
    // or left operator right. It's what can go
    // into a shift expression.
    private parseOperation(): Result<Operation> {
        const left = this.current_token;
        if (!isReadable(left)) {
            return Err(`${left} is not readable!`);
        }
        this.current_token = this.nextToken();
        const operator = this.current_token;
        if (!isOperator(operator)) {
            // There is no operation, return early here.
            return Ok({ left: left });
        }
        this.current_token = this.nextToken();
        const right = this.current_token;
        if (!isReadable(right)) {
            return Err(`${right} is not readable!`);
        }
        this.current_token = this.nextToken();
        return Ok({ left: left, right: right, operator: operator });
    }

    // An expression can be on the right of '<-'.
    private parseExpression(): Result<Expression> {
        let shift: Shift | undefined;
        switch (this.current_token) {
            case 'lsh':
                shift = 'left';
                break;
            case 'rsh':
                shift = 'right';
                break;
        }
        let operationResult: Result<Operation>;
        if (shift !== undefined) {
            // Skip lsh or rsh
            this.current_token = this.nextToken();
            if (this.current_token != '(') {
                return Err('Invalid statement.');
            }
            operationResult = this.parseOperation();
            if (!operationResult.ok) {
                return operationResult;
            }
            this.current_token = this.nextToken();
            if (this.current_token != ')') {
                return Err('Invalid statement.');
            }
        } else {
            operationResult = this.parseOperation();
            if (!operationResult.ok) {
                return operationResult;
            }
        }
        return Ok({ ...operationResult.result, shift: shift });
    }

    private parseStatement(): Result<Statement> {
        // It could start with a location or a call to lsh/rsh.
        if (!isLocation(this.current_token)) {
            // If the statement doesn't start with a location it must be a lsh/rsh.
            return this.parseExpression();
        }
        const location = this.current_token;
        const peekedToken = this.peekToken();
        if (peekedToken !== '<-') {
            // The location is just the left hand side of an operation.
            return this.parseExpression();
        }
        // Now that we know that location is the left-hand side
        // of an assignment we can narrow it down to Writable.
        if (!isWritable(location)) {
            return Err(`${location} is not writable!`);
        }
        this.nextToken(); // Skip '<-'
        this.current_token = this.nextToken();
        const expressionResult = this.parseExpression();
        if (!expressionResult.ok) {
            return expressionResult;
        }
        return Ok({ ...expressionResult.result, dest: location });
    }

    public parse(): Result<ParsedInstruction> {
        while (this.current_token !== undefined && this.error === undefined) {
            if (this.current_token === 'goto' || this.current_token === 'if') {
                const jump = this.parseJump();
                if (!jump.ok) return jump;
                this.result.jump = jump.result;
            } else if (
                this.current_token === 'rd' ||
                this.current_token === 'wr'
            ) {
                const readWriteResult = this.parseReadWrite(this.current_token);
                if (!readWriteResult.ok) return readWriteResult;
            } else {
                const statement = this.parseStatement();
                if (!statement.ok) return statement;
                this.result.statements.push(statement.result);
            }
        }
        return Ok(this.result);
    }
}
