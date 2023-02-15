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
const WRITE_ONLY_BUFFER = 'MAR';
const READ_ONLY_BUFFER = 'MBR';

export type Constant = keyof typeof CONSTANT_REGISTERS;
export type Register = keyof typeof REGISTERS;
export type RegisterOrConstant = Register | Constant;
export type MemoryBuffer = typeof BUFFERS[number];
export type WriteOnlyBuffer = typeof WRITE_ONLY_BUFFER;
export type ReadOnlyBuffer = typeof READ_ONLY_BUFFER;
export type RefisterOrMemoryBurffer = Register | MemoryBuffer;
export type Writable = Register | MemoryBuffer;
export type Readable = Register | Constant | ReadOnlyBuffer;

export function isWritable(name: string): name is Writable {
    return name in REGISTERS || name === WRITE_ONLY_BUFFER;
}

export function isReadable(name: string): name is Readable {
    return (
        name in REGISTERS ||
        name in CONSTANT_REGISTERS ||
        name === READ_ONLY_BUFFER
    );
}

export function isRegister(name: string): name is Register {
    return name in REGISTERS;
}

export function isMemoryBuffer(name: string): name is MemoryBuffer {
    return name in BUFFERS;
}

type ConstantString = '0' | '1' | '-1';

export function isCOnstantRegister(name: string): name is ConstantString {
    switch (name) {
        case '0':
        case '1':
        case '-1':
            return true;
        default:
            return false;
    }
}

export function toConstantRegister(name: ConstantString): Constant {
    switch (name) {
        case '0':
            return 'ZERO';
        case '1':
            return 'ONE';
        case '-1':
            return 'MINUS_ONE';
    }
}

export function getRegisterIndex(name: string): number | null {
    if (isRegister(name)) {
        return REGISTERS[name];
    } else {
        return null;
    }
}
