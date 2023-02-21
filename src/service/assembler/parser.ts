import { isReadable, Writable, Readable } from '../registers';
import {
    Err,
    Expression,
    isOperator,
    Jump,
    Ok,
    Operation,
    ParsedInstruction,
    ReadWriteToken,
    Result,
    Shift,
    Statement,
    Token,
} from './types';
import { lex } from './lexer';

export function parseLine(line: string): Result<ParsedInstruction> {
    const lexResult = lex(line);
    if (!lexResult.ok) {
        return lexResult;
    }
    const parser = new Parser(lexResult.result);
    return parser.parse();
}

class Parser {
    tokens: Token[];
    current_token?: Token;

    seenReadWrite = false;
    seenGoto = false;

    result: ParsedInstruction = {
        statements: [],
    };

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current_token = this.nextToken();
    }

    private peekToken(): Token | undefined {
        return this.tokens[0];
    }

    private nextToken(): Token | undefined {
        return this.tokens.shift();
    }

    private parseReadWrite(): Result<{}> {
        if (this.seenReadWrite) {
            return Err('Only one read/write permitted');
        }
        this.seenReadWrite = true;
        this.result.readWrite = (
            this.current_token as ReadWriteToken
        ).readWrite;
        this.current_token = this.nextToken();
        return Ok({});
    }

    private parseJump(): Result<Jump> {
        if (this.seenGoto) {
            return Err('Only one goto permitted.');
        }
        this.seenGoto = true;
        let condition: 'N' | 'Z' | undefined;
        if (this.current_token?.type === 'IF') {
            this.current_token = this.nextToken();
            if (this.current_token?.type !== 'CONDITION') {
                return Err('Invalid jump statement!');
            }
            condition = this.current_token.condition;
            this.current_token = this.nextToken();
        }
        if (this.current_token?.type !== 'GOTO') {
            return Err('Invalid jump statement!');
        }
        this.current_token = this.nextToken();
        if (this.current_token?.type !== 'NUMBER') {
            return Err('Invalid jump statement!');
        }
        const jumpAddress = this.current_token.number;
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
        const leftToken = this.current_token;
        if (leftToken?.type !== 'LOCATION') {
            return Err('Invalid instruction.');
        }
        const left = leftToken.location;
        if (!isReadable(left)) {
            return Err(`${left} is not readable!`);
        }
        this.current_token = this.nextToken();
        if (this.current_token?.type !== 'OPERATOR') {
            // There is no operation, return early here.
            return Ok({ left: left });
        }
        const operator = this.current_token.operator;
        this.current_token = this.nextToken();
        const rightToken = this.current_token;
        if (rightToken?.type !== 'LOCATION') {
            return Err('Expected location after operator.');
        }
        if (!rightToken.readable) {
            return Err(`${rightToken.location} is not readable!`);
        }
        this.current_token = this.nextToken();
        return Ok({
            left: left,
            right: rightToken.location as Readable,
            operator: operator,
        });
    }

    // An expression can be on the right of '<-'.
    private parseExpression(): Result<Expression> {
        let shift: Shift | undefined;
        let operationResult: Result<Operation>;
        if (this.current_token?.type === 'FUNCTION') {
            shift = this.current_token.name === 'lsh' ? 'left' : 'right';
            this.current_token = this.nextToken();
            if (this.current_token?.type !== 'L_PAREN') {
                return Err('Invalid statement.');
            }
            operationResult = this.parseOperation();
            if (!operationResult.ok) {
                return operationResult;
            }
            this.current_token = this.nextToken();
            if (this.current_token?.type !== 'R_PAREN') {
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
        if (this.current_token?.type !== 'LOCATION') {
            // If the statement doesn't start with a location it must
            // be a an expression (starting with lsh/rsh).
            return this.parseExpression();
        }
        const locationToken = this.current_token;
        const peekedToken = this.peekToken();
        if (peekedToken?.type !== 'ARROW') {
            // The location is just the left hand side of an operation.
            return this.parseExpression();
        }
        // Now that we know that location is the left-hand side
        // of an assignment we can narrow it down to Writable.
        if (!locationToken.writable) {
            return Err(`${locationToken.location} is not writable!`);
        }
        this.nextToken(); // Skip '<-'
        this.current_token = this.nextToken();
        const expressionResult = this.parseExpression();
        if (!expressionResult.ok) {
            return expressionResult;
        }
        return Ok({
            ...expressionResult.result,
            dest: locationToken.location as Writable,
        });
    }

    public parse(): Result<ParsedInstruction> {
        while (this.current_token !== undefined) {
            if (
                this.current_token.type === 'GOTO' ||
                this.current_token.type === 'IF'
            ) {
                const jump = this.parseJump();
                if (!jump.ok) {
                    return jump;
                }
                this.result.jump = jump.result;
            } else if (this.current_token.type === 'READ_WRITE') {
                const readWriteResult = this.parseReadWrite();
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
