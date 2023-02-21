import { Location, getRegisterIndex, Register, Constant } from '../registers';
import {
    ParsedInstruction,
    Result,
    Ok,
    EmptyResult,
    Err,
    Operation,
    Operator,
    EmptyOk,
    Shift,
} from './types';

export class Assembler {
    private instruction: ParsedInstruction;
    private result: number = 0;

    private busA?: Register | Constant;
    private busB?: Register | Constant | 'MBR';
    private busS?: Register | Constant;

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

    private assembleStatements(): EmptyResult {
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
            this.useOperator(stmt.operator);

            if (stmt.dest === 'MAR') {
                if (stmt.right !== undefined) {
                    return Err('MAR with binary operation.');
                }
                if (this.busB !== undefined && this.busB !== stmt.left) {
                    return Err(`Bus B is already busy with ${this.busB}.`);
                }
                this.busB = stmt.left;
                this.mar = true;
            } else {
                if (stmt.dest === 'MBR') {
                    this.mbr = true;
                } else {
                    if (this.busS !== undefined && this.busS !== stmt.dest) {
                        return Err(`Bus S is already busy with ${this.busS}.`);
                    }
                }
                if (stmt.left === this.busA) {
                    if (
                        stmt.right !== undefined &&
                        this.busB !== undefined &&
                        stmt.right !== this.busB
                    ) {
                        return Err(`Bus B is already busy with ${this.busB}.`);
                    }
                    this.busA = stmt.left;
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
                        if (
                            this.busB !== undefined &&
                            stmt.left !== this.busB
                        ) {
                            return Err(
                                `Bus B is already busy with ${this.busB}.`
                            );
                        }
                        this.busB = stmt.left;
                    } else if (stmt.right === this.busB) {
                        if (
                            this.busA !== undefined &&
                            stmt.left !== this.busA
                        ) {
                            return Err(
                                `Bus A is already busy with ${this.busA}.`
                            );
                        }
                        this.busA = stmt.right;
                    }
                }
            }
        }

        if (this.busA !== undefined) {
            this.result |= getRegisterIndex(this.busA);
        }

        return EmptyOk();
    }

    public assemble(): Result<number> {
        const readWrite = this.instruction.readWrite;
        if (readWrite === 'rd') {
            this.result |= 0x0060_0000;
        } else if (readWrite === 'wr') {
            this.result |= 0x0020_0000;
        }

        const jump = this.instruction.jump;
        if (jump !== undefined) {
            if (jump.condition === 'N') {
                this.result |= 0x2000_0000;
            } else if (jump.condition === 'Z') {
                this.result |= 0x4000_0000;
            } else {
                this.result |= 0x6000_0000;
            }
            this.result |= jump.toAddress;
        }

        const assemblingResult = this.assembleStatements();
        if (!assemblingResult.ok) {
            return assemblingResult;
        }

        return { ok: true, result: this.result };
    }
}
