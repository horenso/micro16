import { defineStore } from 'pinia';
import { assembleLine } from '@/service/assembling';
import { formatNumber } from '@/service/formatting';
import { useSettingsStore } from '@/stores/settings';
import { lexNeverFail } from '@/service/assembler/lexer';
import { Token } from '@/service/assembler/token';

interface ErrorReport {
    lineNumber: number;
    errorMessage: string;
}

interface CodeState {
    code: string;
    assembledCode: number[];
    // Whether the code has been edited since last assembling.
    isDirty: boolean;
    errors: ErrorReport[];
}

export const useCodeStore = defineStore('code', {
    state: (): CodeState => ({
        code: '',
        assembledCode: [],
        isDirty: false,
        errors: [],
    }),
    getters: {
        tokenizedLines: (state): Token[][] => {
            return state.code.split('\n').map((l) => lexNeverFail(l));
        },
        assembledCodeString: (state): string => {
            if (state.errors.length > 0) {
                return state.errors
                    .map((e) => `${e.lineNumber}: ${e.errorMessage}`)
                    .join('\n');
            }
            if (state.isDirty) {
                return 'Code changed - please Assemble';
            }
            return state.assembledCode
                .map((code) =>
                    formatNumber(
                        code,
                        useSettingsStore().numberSystem as 2 | 10 | 16,
                        32
                    )
                )
                .join('\n');
        },
    },
    actions: {
        setCode(newCode: string): void {
            this.code = newCode;
            this.assembledCode = [];
            this.isDirty = true;
        },
        assemble(): void {
            let newAssembledCode: number[] = [];
            this.errors = [];
            const lines = this.code.split('\n');
            for (let i = 0; i < lines.length; ++i) {
                const line = lines[i];
                const result = assembleLine(line);
                if (!result.ok) {
                    this.errors.push({
                        lineNumber: i,
                        errorMessage: result.errorMessage,
                    });
                } else {
                    newAssembledCode.push(result.result);
                }
            }
            this.isDirty = false;
            if (this.errors.length > 0) {
                this.assembledCode = [];
            } else {
                this.assembledCode = newAssembledCode;
            }
        },
    },
});
