import { assembleLine, AssemblingError } from './assembling';
import { test, expect } from 'vitest';

test('Read/Write', () => {
    expect(assembleLine('wr')).toBe(0x0020_0000);
    expect(assembleLine('rd')).toBe(0x0060_0000);
    expect(assembleLine('rd;rd')).toBeInstanceOf(AssemblingError);
    expect(assembleLine('wr;rd')).toBeInstanceOf(AssemblingError);
    expect(assembleLine('wr;wr')).toBeInstanceOf(AssemblingError);
});

test('Jumps', () => {
    expect(assembleLine(';;goto 4;')).toBe(0x6000_0004);
    expect(assembleLine('goto   255;;')).toBe(0x6000_00ff);
    expect(assembleLine('goto -1')).toBeInstanceOf(AssemblingError);
    expect(assembleLine('goto 256')).toBeInstanceOf(AssemblingError);
    expect(assembleLine('if N goto 50')).toBe(0x2000_0032);
    expect(assembleLine('if Z goto 50')).toBe(0x4000_0032);
    expect(assembleLine('(R1); if Z goto 30')).toBe(0x4000_051e);
    expect(assembleLine('R1 if Z goto 30')).toBe(0x4000_051e);
    expect(assembleLine('(((R1)));;; if Z goto 30')).toBe(0x4000_051e);
});

test('Calculations', () => {
    expect(assembleLine('R1 <- 0')).toBe(0x0015_0000);
    expect(assembleLine('R3 <- 1')).toBe(0x0017_0100);
    expect(assembleLine('AC <- -1')).toBe(0x001f_0200);
    expect(assembleLine('R0 <- R1 + R2')).toBe(0x0814_6500);
    expect(assembleLine('R0 <- lsh(R1 + R2)')).toBe(0x0a146500);
    expect(assembleLine('R0 <- rsh(R1 + R2)')).toBe(0x0c14_6500);
    expect(assembleLine('R1 <- 1 + (-1)')).toBe(0x08152100);
    expect(assembleLine('R1 <- 1 + -1')).toBeInstanceOf(AssemblingError);
});

test('Multiple registers', () => {
    expect(assembleLine('MAR<-R6; R1<-R6; MBR<-R6')).toBe(0x0195_aa00);
    expect(assembleLine('MAR<-R6; MBR<-R8; wr; R1<-R8')).toBe(0x01b5_ac00);
});

test('Multiplication Example', () => {
    // Multiplication example from book page 141
    expect(assembleLine('R7 <- R7+R7')).toBe(0x0a1b_1100);
    expect(assembleLine('R7 <- lsh(1+1)')).toBe(0x081b_bb00);
    expect(assembleLine('R8 <- 0')).toBe(0x001c_0000);
    expect(assembleLine('R6 <- (1+1)')).toBe(0x081a_1100);
    expect(assembleLine('R6 <- R6+1')).toBe(0x081a_1a00);
    expect(assembleLine('MAR <- R6;rd')).toBe(0x00e0_a000);
    expect(assembleLine('rd')).toBe(0x0060_0000);
    expect(assembleLine('R9 <- MBR')).toBe(0x801d_0000);
    expect(assembleLine('R6 <- R6 + 1')).toBe(0x081a_1a00);
    expect(assembleLine('MAR <- R5; rd')).toBe(0x00e0_9000);
    expect(assembleLine('rd')).toBe(0x0060_0000);
    expect(assembleLine('R10<-MBR')).toBe(0x801e_0000);
    expect(assembleLine('R9<-lsh(R9+R9)')).toBe(0x0a1d_dd00);
    expect(assembleLine('R9<-lsh(R9+R9)')).toBe(0x0a1d_dd00);
    expect(assembleLine('R9<-lsh(R9+R9)')).toBe(0x0a1d_dd00);
    expect(assembleLine('R9<-lsh(R9+R9)')).toBe(0x0a1d_dd00);
    expect(assembleLine('(R7);if Z goto 24')).toBe(0x4000_0b18);
    expect(assembleLine('R8 <- lsh(R8)')).toBe(0x021c_0c00);
    expect(assembleLine('(~R9); if N goto 21')).toBe(0x3800_0d15);
    expect(assembleLine('R8 <- R8 + R10')).toBe(0x081c_ec00);
    expect(assembleLine('R9 <- lsh(R9)')).toBe(0x021d_0d00);
    expect(assembleLine('R7 <- R7 + (-1)')).toBe(0x081b_2b00);
    expect(assembleLine('goto 17')).toBe(0x6000_0011);
    expect(assembleLine('R6 <- R6 + R6')).toBe(0x081a_aa00);
    expect(assembleLine('R6 <- R6 + 1')).toBe(0x081a_1a00);
    expect(assembleLine('MAR<-R6; MBR<-R8; wr')).toBe(0x01a0_ac00);
    expect(assembleLine('wr')).toBe(0x0020_0000);
});
