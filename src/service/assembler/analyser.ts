import { Location, RegisterOrConstant } from '../registers';
import {
    ParsedInstruction,
    EmptyResult,
    Err,
    Operator,
    EmptyOk,
    Shift,
    Statement,
    Result,
    AnalysedInstruction,
    Ok,
} from './types';

export function analyse(inst: ParsedInstruction): Result<AnalysedInstruction> {
    return new Analyser(inst).analyse();
}

export class Analyser {
    private instruction: ParsedInstruction;

    private busA?: RegisterOrConstant;
    private busB?: RegisterOrConstant;
    private busS?: RegisterOrConstant;

    private mar = false;
    private mbr = false;
    private aMux = false;

    private operator?: Operator;
    private shift?: Shift;

    constructor(instruction: ParsedInstruction) {
        this.instruction = instruction;
    }

    private useOperator(operator?: Operator): EmptyResult {
        if (operator === undefined) {
            return EmptyOk();
        }
        if (this.operator !== undefined && this.operator !== operator) {
            return Err(`ALU is already busy with ${this.operator}`);
        }
        this.operator = operator;
        return EmptyOk();
    }

    private useShift(shift?: Shift): EmptyResult {
        if (shift === undefined) {
            return EmptyOk();
        }
        if (this.shift !== undefined && this.shift !== shift) {
            return Err(`Shifter is already busy with ${this.shift}`);
        }
        this.shift = shift;
        return EmptyOk();
    }

    private handleStatementDestMAR(statement: Statement): EmptyResult {
        if (statement.right !== undefined) {
            return Err('MAR with binary operation.');
        }
        if (this.busB !== undefined && this.busB !== statement.left) {
            return Err(`Bus B is already busy with ${this.busB}.`);
        }
        this.busB = statement.left;
        this.mar = true;
        return EmptyOk();
    }

    private handleStatementOperandMBR(statement: Statement): EmptyResult {
        if (statement.dest !== undefined) {
            if (this.busS !== undefined && this.busS !== statement.dest) {
                return Err(`Bus S is already busy with ${this.busS}.`);
            }
        }
        if (statement.left === 'MBR') {
            if (statement.right === 'MBR') {
                return Err('MBR cannot be used with both operands.');
            }
            if (statement.right !== undefined) {
                if (this.busB !== undefined && this.busB !== statement.right) {
                    return Err(`Bus B is already busy with ${this.busB}.`);
                }
                this.busB = statement.right;
            }
        } else {
            if (this.busB !== undefined && this.busB !== statement.left) {
                return Err(`Bus B is already busy with ${this.busB}.`);
            }
            this.busB = statement.left;
        }
        return EmptyOk();
    }

    // Any statement that doesn't have dest=MAR or MBR as one of its operands.
    private handleOtherStatement(stmt: Statement): EmptyResult {
        if (this.busS !== undefined && this.busS !== stmt.dest) {
            return Err(`Bus S is already busy with ${this.busS}.`);
        }
        if (
            stmt.left === this.busA ||
            (stmt.right !== undefined && stmt.right === this.busA)
        ) {
            if (
                stmt.right !== undefined &&
                this.busB !== undefined &&
                stmt.right !== this.busB
            ) {
                return Err(`Bus B is already busy with ${this.busB}.`);
            }
            this.busA = stmt.left as RegisterOrConstant;
        } else if (stmt.left === this.busB) {
            if (
                stmt.right !== undefined &&
                this.busA !== undefined &&
                stmt.right !== this.busA
            ) {
                return Err(`Bus A is already busy with ${this.busA}.`);
            }
            this.busB = stmt.left;
        } else if (stmt.right !== undefined) {
            if (stmt.right === this.busA) {
                if (this.busB !== undefined && stmt.left !== this.busB) {
                    return Err(`Bus B is already busy with ${this.busB}.`);
                }
                this.busB = stmt.left as RegisterOrConstant;
            } else if (stmt.right === this.busB) {
                if (this.busA !== undefined && stmt.left !== this.busA) {
                    return Err(`Bus A is already busy with ${this.busA}.`);
                }
                this.busA = stmt.right as RegisterOrConstant;
            }
        }
        return EmptyOk();
    }

    private anayseStatements(): EmptyResult {
        // Sort statements:
        // First statements that contain MBR as one operand,
        // then assignments to MAR.
        this.instruction.statements.sort((a, b) => {
            if (a.left === 'MBR' || a.right === 'MBR') {
                return -1;
            }
            if (b.left === 'MBR' || b.right === 'MBR') {
                return 1;
            }
            if (a.dest === 'MAR') {
                return -1;
            }
            if (b.dest === 'MAR') {
                return 1;
            }
            return 0;
        });
        console.table(this.instruction.statements);

        for (let stmt of this.instruction.statements) {
            let result = this.useOperator(stmt.operator);
            if (!result.ok) return result;

            result = this.useShift(stmt.shift);
            if (!result.ok) return result;

            if (stmt.dest === 'MAR') {
                result = this.handleStatementDestMAR(stmt);
                if (!result.ok) return result;
            } else if (stmt.left === 'MBR' || stmt.right === 'MBR') {
                result = this.handleStatementOperandMBR(stmt);
                if (!result.ok) return result;
            } else {
                result = this.handleOtherStatement(stmt);
                if (!result.ok) return result;
            }
        }

        return EmptyOk();
    }

    public analyse(): Result<AnalysedInstruction> {
        const readWrite = this.instruction.readWrite;

        const analyseStatemetsResult = this.anayseStatements();
        if (!analyseStatemetsResult.ok) {
            return analyseStatemetsResult;
        }

        return Ok({
            busA: this.busA !== undefined ? this.busA : 'ZERO',
            busB: this.busB !== undefined ? this.busB : 'ZERO',
            busS: this.busS !== undefined ? this.busS : 'ZERO',
            operator: this.operator,
            marFlag: this.mar,
            mbrFlag: this.mbr,
            aMuxFlag: this.aMux,
            jump: this.instruction.jump,
            readWrite: this.instruction.readWrite,
        });
    }
}
