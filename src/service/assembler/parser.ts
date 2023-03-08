import { isReadable, isWritable } from '@/service/registers';
import {
    EmptyOk,
    EmptyResult,
    Err,
    Expression,
    Jump,
    Ok,
    Operation,
    ParsedInstruction,
    Result,
    Statement,
} from './types';
import { lex } from './lexer';
import { Token, ReadWriteToken } from './token';

export function parseLine(line: string): Result<ParsedInstruction> {
    let result = lex(line);
    if (!result.ok) return result;
    return parse(result.result);
}

export function parse(tokens: Token[]): Result<ParsedInstruction> {
    return new Parser(tokens).parse();
}

class Parser {
    tokens: Token[];

    seenReadWrite = false;
    seenGoto = false;

    result: ParsedInstruction = {
        statements: [],
    };

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peekToken(offset?: number): Token | undefined {
        if (offset !== undefined) {
            return this.tokens[0 + offset];
        }
        return this.tokens[0];
    }

    private eatToken(): Token | undefined {
        return this.tokens.shift();
    }

    private parseReadWrite(): EmptyResult {
        if (this.seenReadWrite) {
            return Err('Only one read/write permitted.');
        }
        this.seenReadWrite = true;
        const readWriteToken = this.eatToken();
        this.result.readWrite = (readWriteToken as ReadWriteToken).readWrite;
        return EmptyOk();
    }

    // A jump can be:
    // - Just a goto like: "goto 4"
    // - A goto with a condition like: "if N goto 5".
    private parseJump(): Result<Jump> {
        if (this.seenGoto) {
            return Err('Only one goto permitted.');
        }
        this.seenGoto = true;
        let currentToken = this.eatToken();
        let condition: 'N' | 'Z' | undefined;
        if (currentToken?.type === 'IF') {
            currentToken = this.eatToken();
            if (currentToken?.type !== 'CONDITION') {
                return Err('Invalid jump statement.');
            }
            condition = currentToken.condition;
            currentToken = this.eatToken();
        }
        if (currentToken?.type !== 'GOTO') {
            return Err('Invalid jump statement.');
        }
        currentToken = this.eatToken();
        if (currentToken?.type !== 'JUMP_ADDRESS') {
            return Err('Invalid jump statement.');
        }
        const jumpAddress = currentToken.number;
        if (jumpAddress < 0 || jumpAddress > 255) {
            return Err('Jump address must be between 0 and 255.');
        }
        return Ok({ condition: condition, toAddress: jumpAddress });
    }

    // An operation can be:
    // - Just a location like "R1"
    // - A unary operation with an operand: "~R1"
    // - A binary operation like: "1+R2"
    private parseOperation(): Result<Operation> {
        const firstToken = this.eatToken();
        if (firstToken?.type === 'UNARY_OPERATOR') {
            const operator = firstToken.operator;
            const locationToken = this.eatToken();
            if (locationToken?.type !== 'LOCATION') {
                return Err(`Expected register after ${operator}.`);
            }
            if (!isReadable(locationToken.location)) {
                return Err(`${locationToken.location} is not readable.`);
            }
            return Ok({ left: locationToken.location, operator: operator });
        }
        if (firstToken?.type !== 'LOCATION') {
            return Err('Invalid instruction.');
        }
        const left = firstToken.location;
        if (!isReadable(left)) {
            return Err(`${left} is not readable.`);
        }
        const maybeOperatorToken = this.peekToken();
        if (maybeOperatorToken?.type === 'UNARY_OPERATOR') {
            return Err(`${maybeOperatorToken.operator} is a unary operator.`);
        }
        if (maybeOperatorToken?.type !== 'BINARY_OPERATOR') {
            // There is no operation, return early here.
            return Ok({ left: left });
        }
        const operator = maybeOperatorToken.operator;
        this.eatToken(); // Eat operator
        const rightToken = this.eatToken();
        if (rightToken?.type !== 'LOCATION') {
            return Err('Expected location after operator.');
        }
        if (!isReadable(rightToken.location)) {
            return Err(`${rightToken.location} is not readable.`);
        }
        return Ok({
            left: left,
            right: rightToken.location,
            operator: operator,
        });
    }

    // An expression can be:
    // - A function like "lsh(<operation>)"
    // - An operation with parentheses around "(<operation>)"
    // - Just an operation "<operation>"
    private parseExpression(): Result<Expression> {
        let peekedToken = this.peekToken();
        if (peekedToken?.type === 'FUNCTION') {
            this.eatToken();
            const functionToken = peekedToken;
            const shift = functionToken.name;
            const lParenToken = this.eatToken();
            if (lParenToken?.type !== 'L_PAREN') {
                return Err('Invalid statement.');
            }
            const operationResult = this.parseOperation();
            if (!operationResult.ok) return operationResult;

            const rParenToken = this.eatToken();
            if (rParenToken?.type !== 'R_PAREN') {
                return Err(`Missing ")" after function ${shift}.`);
            }
            return Ok({ ...operationResult.result, shift: shift });
        } else if (peekedToken?.type === 'L_PAREN') {
            this.eatToken();
            const operationResult = this.parseOperation();
            if (!operationResult.ok) return operationResult;

            const rParenToken = this.eatToken();
            if (rParenToken?.type !== 'R_PAREN') {
                return Err('Missing ")".');
            }
            return Ok({ ...operationResult.result });
        } else {
            const operationResult = this.parseOperation();
            if (!operationResult.ok) {
                return operationResult;
            }
            return Ok({ ...operationResult.result });
        }
    }

    // A statement can be:
    // - An assignment like "R1 <- <expression>"
    // - Just an expression: "<expression>"
    private parseStatement(): Result<Statement> {
        let locationToken = this.peekToken();
        if (locationToken?.type !== 'LOCATION') {
            // If the statement doesn't start with a location it must
            // be a an expression (starting with lsh/rsh or '(').
            return this.parseExpression();
        }
        const secondPeekedToken = this.peekToken(1);
        if (secondPeekedToken?.type !== 'ARROW') {
            // The location is just the left hand side of an operation.
            return this.parseExpression();
        }
        // Now that we know that location is the left-hand side
        // of an assignment we can narrow it down to Writable.
        if (!isWritable(locationToken.location)) {
            return Err(`${locationToken.location} is not writable.`);
        }
        this.eatToken(); // Eat location
        this.eatToken(); // Eat '<-'

        const expressionResult = this.parseExpression();
        if (!expressionResult.ok) return expressionResult;

        return Ok({
            ...expressionResult.result,
            dest: locationToken.location,
        });
    }

    public parse(): Result<ParsedInstruction> {
        while (this.tokens.length > 0) {
            // current_token must be Token because of the while condition.
            const currentToken = this.peekToken() as Token;
            if (currentToken.type === 'GOTO' || currentToken.type === 'IF') {
                const jump = this.parseJump();
                if (!jump.ok) {
                    return jump;
                }
                this.result.jump = jump.result;
            } else if (currentToken.type === 'READ_WRITE') {
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
