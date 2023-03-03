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
    AnalyzedInstruction,
    Ok,
} from './types';

export function analyze(inst: ParsedInstruction): Result<AnalyzedInstruction> {
    return new Analyzer(inst).analyze();
}

export class Analyzer {
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

    private setOperator(operator?: Operator): EmptyResult {
        if (operator === undefined) {
            return EmptyOk();
        }
        if (this.operator !== undefined && this.operator !== operator) {
            return Err(`ALU is already busy with ${this.operator}.`);
        }
        this.operator = operator;
        return EmptyOk();
    }

    private setShift(shift?: Shift): EmptyResult {
        if (shift === undefined) {
            return EmptyOk();
        }
        if (this.shift !== undefined && this.shift !== shift) {
            return Err(`Shifter is already busy with ${this.shift}.`);
        }
        this.shift = shift;
        return EmptyOk();
    }

    private setBus(
        bus: 'busA' | 'busB' | 'busS',
        value?: RegisterOrConstant
    ): EmptyResult {
        if (value === undefined) {
            return EmptyOk();
        }
        if (bus === 'busA' && this.aMux) {
            return Err('Bus A cannot be used since AMUX is set.');
        }
        if (this[bus] !== undefined && this[bus] != value) {
            return Err(
                `Bus ${bus[bus.length - 1]} is already busy with ${this[bus]}.`
            );
        }
        this[bus] = value;
        return EmptyOk();
    }

    private sortStatements(): void {
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
    }

    private handleStatementDestMAR(stmt: Statement): EmptyResult {
        if (stmt.left === 'MBR' || stmt.right === 'MBR') {
            return Err('MBR cannot be used as input for MAR.');
        }
        if (stmt.right !== undefined) {
            return Err('MAR with binary operation.');
        }
        if (this.busB !== undefined && this.busB !== stmt.left) {
            return Err(`Bus B is already busy with ${this.busB}.`);
        }
        this.busB = stmt.left as RegisterOrConstant;
        this.mar = true;
        return EmptyOk();
    }

    private handleStatementOperandMBR(stmt: Statement): EmptyResult {
        if (stmt.dest === 'MBR') {
            this.mbr = true;
        } else {
            let result = this.setBus('busS', stmt.dest as RegisterOrConstant);
            if (!result.ok) return result;
        }

        if (stmt.left === 'MBR') {
            if (stmt.right === 'MBR') {
                return Err('Only one operand can be MBR.');
            }
            this.setBus('busB', stmt.right);
            this.aMux = true;
        } else {
            if (this.busB !== undefined && this.busB !== stmt.left) {
                return Err(`Bus B is already busy with ${this.busB}.`);
            }
            this.busB = stmt.left;
        }
        return EmptyOk();
    }

    // No operand, only a left-hand side.
    private handlePassThroughStatement(stmt: Statement): EmptyResult {
        if (stmt.dest === 'MBR') {
            this.mbr = true;
        } else {
            let result = this.setBus('busS', stmt.dest as RegisterOrConstant);
            if (!result.ok) return result;
        }
        let result = this.setBus('busA', stmt.left as RegisterOrConstant);
        if (!result.ok) return result;
        return EmptyOk();
    }

    // Any statement that doesn't have dest=MAR or MBR as one of its operands.
    private handleOtherStatement(stmt: Statement): EmptyResult {
        if (stmt.dest === 'MBR') {
            this.mbr = true;
        } else {
            let result = this.setBus('busS', stmt.dest as RegisterOrConstant);
            if (!result.ok) return result;
        }

        // Assign left to either busA or busB
        let leftBus: 'busA' | 'busB';

        if (stmt.left === this.busA) {
            leftBus = 'busA';
        } else if (stmt.left === this.busB) {
            leftBus = 'busB';
        } else {
            if (this.busA === undefined) {
                leftBus = 'busA';
            } else {
                leftBus = 'busB';
            }
            let result = this.setBus(leftBus, stmt.left as RegisterOrConstant);
            if (!result.ok) return result;
        }

        // Assign right bus to whatever bus left didn't occupy
        if (stmt.right !== undefined) {
            let rightBus: 'busA' | 'busB';
            if (leftBus === 'busA') {
                rightBus = 'busB';
            } else {
                rightBus = 'busA';
            }
            let result = this.setBus(
                rightBus,
                stmt.right as RegisterOrConstant
            );
            if (!result.ok) return result;
        }
        return EmptyOk();
    }

    private anayseStatements(): EmptyResult {
        this.sortStatements();

        for (let stmt of this.instruction.statements) {
            let result = this.setOperator(stmt.operator);
            if (!result.ok) return result;

            result = this.setShift(stmt.shift);
            if (!result.ok) return result;

            if (stmt.dest === 'MAR') {
                result = this.handleStatementDestMAR(stmt);
                if (!result.ok) return result;
            } else if (stmt.left === 'MBR' || stmt.right === 'MBR') {
                result = this.handleStatementOperandMBR(stmt);
                if (!result.ok) return result;
            } else if (stmt.operator === undefined) {
                result = this.handlePassThroughStatement(stmt);
                if (!result.ok) return result;
            } else {
                result = this.handleOtherStatement(stmt);
                if (!result.ok) return result;
            }
        }

        return EmptyOk();
    }

    public analyze(): Result<AnalyzedInstruction> {
        const readWrite = this.instruction.readWrite;

        const result = this.anayseStatements();
        if (!result.ok) {
            return result;
        }

        return Ok({
            busA: this.busA !== undefined ? this.busA : 'ZERO',
            busB: this.busB !== undefined ? this.busB : 'ZERO',
            busS: this.busS !== undefined ? this.busS : 'ZERO',
            operator: this.operator,
            shift: this.shift,
            marFlag: this.mar,
            mbrFlag: this.mbr,
            aMuxFlag: this.aMux,
            jump: this.instruction.jump,
            readWrite: this.instruction.readWrite,
        });
    }
}
