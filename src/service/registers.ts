const CONSTANT_REGISTERS = {
    ZERO: 0x0,
    ONE: 0x1,
    MINUS_ONE: 0x2,
} as const;

const REGISTERS = {
    PC: 0x3,
    R0: 0x4,
    R1: 0x5,
    R2: 0x6,
    R3: 0x7,
    R4: 0x8,
    R5: 0x9,
    R6: 0xa,
    R7: 0xb,
    R8: 0xc,
    R9: 0xd,
    R10: 0xe,
    AC: 0xf,
} as const;

const BUFFERS = ['MAR', 'MBR'] as const;

export type Constant = keyof typeof CONSTANT_REGISTERS;
export type Register = keyof typeof REGISTERS;
export type RegisterOrConstant = Register | Constant;
export type MemoryBuffer = typeof BUFFERS[number];
export type WriteOnlyBuffer = 'MAR';
export type ReadOnlyBuffer = 'MBR';
export type RefisterOrMemoryBurffer = Register | MemoryBuffer;

export function isRegister(name: string): name is Register {
    return name in REGISTERS;
}

export function isMemoryBuffer(name: string): name is MemoryBuffer {
    return name in BUFFERS;
}

export function isConstantRegister(name: string): boolean {
    switch (name) {
        case '0':
        case '1':
        case '-1':
            return true;
        default:
            return false;
    }
}

export function toRegister(name: string): Register | null {
    if (isRegister(name)) {
        return name;
    } else {
        return null;
    }
}

export function getRegisterIndex(name: string): number | null {
    if (isRegister(name)) {
        return REGISTERS[name];
    } else {
        return null;
    }
}
