import { defineStore } from 'pinia';
import { assembleLine } from '../service/assembling';
import { formatNumber } from '../service/formatting';
import { useSettingsStore } from './settings';
import { lexNeverFail } from '../service/assembler/lexer';

export const useCodeStore = defineStore('code', {
    state: () => ({
        code: '',
        isDirty: true,
        assembledCode: [],
        tokenLines: [],
    }),
    getters: {
        tokenizedLines: (state) => {
            return state.code.split('\n').map((l) => lexNeverFail(l));
        },
        assembledCodeString: (state) => {
            return state.assembledCode
                .map((code) => {
                    if (typeof code === 'string') {
                        return code;
                    } else {
                        return formatNumber(
                            code,
                            useSettingsStore().numberSystem as 2 | 10 | 16,
                            32
                        );
                    }
                })
                .join('\n');
        },
    },
    actions: {
        assemble() {
            if (this.code === '') {
                this.assembledCode = [];
                return;
            }
            let newAssembledCode: any = [];
            const lines = this.code.split('\n');
            lines.forEach((line) => {
                const result = assembleLine(line);
                if (result.ok) {
                    newAssembledCode.push(result.result);
                } else {
                    newAssembledCode.push(result.errorMessage);
                }
            });
            this.assembledCode = newAssembledCode;
        },
    },
});
