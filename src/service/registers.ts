import { readonly } from 'vue';

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

const BUFFERS: readonly string[] = ['MAR', 'MBR'] as const;
const WRITE_ONLY_BUFFER = 'MAR';
const READ_ONLY_BUFFER = 'MBR';

export type Constant = keyof typeof CONSTANT_REGISTERS;
export type Register = keyof typeof REGISTERS;
export type RegisterOrConstant = Register | Constant;
export type MemoryBuffer = 'MAR' | 'MBR';
export type WriteOnlyBuffer = typeof WRITE_ONLY_BUFFER;
export type ReadOnlyBuffer = typeof READ_ONLY_BUFFER;
export type RegisterOrMemoryBuffer = Register | MemoryBuffer;
export type Writable = Register | MemoryBuffer;
export type Readable = Register | Constant | ReadOnlyBuffer;
export type Location = Register | Constant | MemoryBuffer;

export function isLocation(name?: string): name is Location {
    if (name === undefined) {
        return false;
    }
    return (
        name in REGISTERS ||
        name in CONSTANT_REGISTERS ||
        BUFFERS.includes(name)
    );
}

export function isWritable(name?: string): name is Writable {
    if (name === undefined) {
        return false;
    }
    return name in REGISTERS || BUFFERS.some((b) => b === name);
}

export function isReadable(name?: string): name is Readable {
    if (name === undefined) {
        return false;
    }
    return (
        name in REGISTERS ||
        name in CONSTANT_REGISTERS ||
        name === READ_ONLY_BUFFER
    );
}

export function isRegister(name?: string): name is Register {
    if (name === undefined) {
        return false;
    }
    return name in REGISTERS;
}

export function isConstant(name?: string): name is Constant {
    if (name === undefined) {
        return false;
    }
    return name in CONSTANT_REGISTERS;
}

export function isMemoryBuffer(name?: string): name is MemoryBuffer {
    if (name === undefined) {
        return false;
    }
    return name in BUFFERS;
}

export function getRegisterIndex(name: RegisterOrConstant): number {
    if (isRegister(name)) {
        return REGISTERS[name];
    } else {
        return CONSTANT_REGISTERS[name];
    }
}
