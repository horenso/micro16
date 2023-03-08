import { test, expect } from 'vitest';
import { assembleLine } from './assembling';

function testAssembleSuccess(line: string, result: number) {
    expect(assembleLine(line)).toMatchObject({ ok: true, result: result & -1 });
}

function testAssemblingError(line: string) {
    expect(assembleLine(line)).toMatchObject({ ok: false });
}

test('Read/Write', () => {
    testAssembleSuccess('wr', 0x0020_0000);
    testAssembleSuccess('rd', 0x0060_0000);
    testAssemblingError('rd;rd');
    testAssemblingError('wr;rd');
    testAssemblingError('wr;wr');
});

test('Jumps', () => {
    testAssembleSuccess(';;goto 4;', 0x6000_0004);
    testAssembleSuccess('goto   255;;', 0x6000_00ff);
    testAssemblingError('goto -1');
    testAssemblingError('goto 256');
    testAssembleSuccess('if N goto 50', 0x2000_0032);
    testAssembleSuccess('if Z goto 50', 0x4000_0032);
    testAssembleSuccess('(R1); if Z goto 30', 0x4000_051e);
    testAssembleSuccess('R1 if Z goto 30', 0x4000_051e);
    testAssembleSuccess('(R1);;; if Z goto 30', 0x4000_051e);
});

test('Calculations', () => {
    testAssembleSuccess('1 + 1', 0x0800_1100);
    testAssembleSuccess('R1 <- 0', 0x0015_0000);
    testAssembleSuccess('R3 <- 1', 0x0017_0100);
    testAssembleSuccess('AC <- -1', 0x001f_0200);
    testAssembleSuccess('R0 <- R1 + R2', 0x0814_6500);
    testAssembleSuccess('R0 <- lsh(R1 + R2)', 0x0a146500);
    testAssembleSuccess('R0 <- rsh(R1 + R2)', 0x0c14_6500);
    testAssembleSuccess('R1 <- 1 + (-1)', 0x0815_2100);
    testAssembleSuccess('R1 <- 1 + -1', 0x0815_2100);
    testAssembleSuccess('R1 <- ~ (-1)', 0x1815_0200);
});

test('Multiple registers', () => {
    testAssembleSuccess('MAR<-R6; R1<-R6; MBR<-R6', 0x0195_aa00);
    testAssembleSuccess('MAR<-R6; MBR<-R8; wr; R1<-R8', 0x01b5_ac00);
});

test('Edge cases', () => {
    testAssembleSuccess('MBR<-MBR', 0x8100_0000); // MBR can be assigned to MBR
    testAssemblingError('R1 <- 1~1'); // ~ takes only one operand
    testAssemblingError('MAR <- MBR'); // "MBR cannot be used as input for MAR."
});

test('Multiplication Example', () => {
    // Multiplication example from book page 141
    testAssembleSuccess('R7 <- R7+R7', 0x081b_bb00);
    testAssembleSuccess('R7 <- lsh(1+1)', 0x0a1b_1100);
    testAssembleSuccess('R8 <- 0', 0x001c_0000);
    testAssembleSuccess('R6 <- (1+1)', 0x081a_1100);
    testAssembleSuccess('R6 <- R6+1', 0x081a_1a00);
    testAssembleSuccess('MAR <- R6;rd', 0x00e0_a000);
    testAssembleSuccess('rd', 0x0060_0000);
    testAssembleSuccess('R9 <- MBR', 0x801d_0000);
    testAssembleSuccess('R6 <- R6 + 1', 0x081a_1a00);
    testAssembleSuccess('MAR <- R5; rd', 0x00e0_9000);
    testAssembleSuccess('rd', 0x0060_0000);
    testAssembleSuccess('R10<-MBR', 0x801e_0000);
    testAssembleSuccess('R9<-lsh(R9+R9)', 0x0a1d_dd00);
    testAssembleSuccess('R9<-lsh(R9+R9)', 0x0a1d_dd00);
    testAssembleSuccess('R9<-lsh(R9+R9)', 0x0a1d_dd00);
    testAssembleSuccess('R9<-lsh(R9+R9)', 0x0a1d_dd00);
    testAssembleSuccess('(R7);if Z goto 24', 0x4000_0b18);
    testAssembleSuccess('R8 <- lsh(R8)', 0x021c_0c00);
    testAssembleSuccess('(~R9); if N goto 21', 0x3800_0d15);
    testAssembleSuccess('R8 <- R8 + R10', 0x081c_ec00);
    testAssembleSuccess('R9 <- lsh(R9)', 0x021d_0d00);
    testAssembleSuccess('R7 <- R7 + (-1)', 0x081b_2b00);
    testAssembleSuccess('goto 17', 0x6000_0011);
    testAssembleSuccess('R6 <- R6 + R6', 0x081a_aa00);
    testAssembleSuccess('R6 <- R6 + 1', 0x081a_1a00);
    testAssembleSuccess('MAR<-R6; MBR<-R8; wr', 0x01a0_ac00);
    testAssembleSuccess('wr', 0x0020_0000);
});
