import { defineStore } from 'pinia';
import { assembleCode } from '@/service/assembling';
import { formatNumber } from '@/service/formatting';
import { useSettingsStore } from '@/stores/settings';
import { lexNeverFail } from '@/service/assembler/lexer';
import { useCpuStore } from './cpu';

interface CodeState {
    code: string;
    activeLineIndex: number;
    assembledCode: number[];
    // Whether the code has been edited since last assembling.
    isDirty: boolean;
    error?: string;
    breakpoints: Set<number>;
}

// TODO: Investigate h() and generated components for this
//       This is for sure not a Vue-y way of doing this.
function sanitize(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getSpan(className: string, text: string, doSanitize: boolean): string {
    return `<span class="${className}">${
        doSanitize ? sanitize(text) : text
    }</span>`;
}

// Get code from localstorage is the key exists
let localStorageCode = localStorage.getItem('code');
const code = localStorageCode !== null ? JSON.parse(localStorageCode) : '';

export const useCodeStore = defineStore('code', {
    state: (): CodeState => ({
        code: code,
        activeLineIndex: 0,
        assembledCode: [],
        isDirty: code !== '',
        error: undefined,
        breakpoints: new Set<number>(),
    }),
    getters: {
        assembledCodeString: (state): string => {
            if (state.error !== undefined) {
                return state.error;
            }
            if (state.isDirty) {
                return 'Code changed\nPlease assemble';
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
        codeOverlay: (state): string => {
            const tokenLines = state.code
                .split('\n')
                .map((l) => lexNeverFail(l));
            let highlightedCode = '';
            for (let [index, line] of tokenLines.entries()) {
                let lineContent = '';
                for (let token of line) {
                    switch (token.type) {
                        case 'GOTO':
                        case 'IF':
                        case 'FUNCTION':
                        case 'LOCATION':
                            lineContent += getSpan('keyword', token.text, true);
                            break;
                        case 'ARROW':
                        case 'UNARY_OPERATOR':
                        case 'BINARY_OPERATOR':
                        case 'L_PAREN':
                        case 'R_PAREN':
                            lineContent += getSpan(
                                'punctuation',
                                token.text,
                                true
                            );
                            break;
                        case 'COMMENT':
                            lineContent += getSpan('comment', token.text, true);
                            break;
                        case 'LABEL_DEFINE':
                        case 'LABEL_TARGET':
                            lineContent += getSpan('label', token.text, true);
                            break;
                        case 'GARBAGE':
                            lineContent += getSpan('garbage', token.text, true);
                            break;
                        case 'JUMP_ADDRESS':
                            lineContent += getSpan('number', token.text, true);
                            break;
                        default:
                            lineContent += token.text;
                            break;
                    }
                }
                const CpuStore = useCpuStore();
                const isActiveLine =
                    CpuStore.isActivated && CpuStore.MIC === index;
                highlightedCode += getSpan(
                    isActiveLine ? 'line active-line' : 'line',
                    lineContent.length > 0 ? lineContent : '\n',
                    false
                );
            }
            return highlightedCode;
        },
    },
    actions: {
        setCode(newCode: string): void {
            this.code = newCode;
            this.assembledCode = [];
            this.isDirty = true;
            localStorage.setItem('code', JSON.stringify(this.code));
        },
        assemble(): void {
            this.error = undefined;
            const result = assembleCode(this.code.split('\n'));
            if (!result.ok) {
                this.error = result.errorMessage;
                this.assembledCode = [];
                return;
            }
            this.isDirty = false;
            this.assembledCode = result.result;
        },
    },
});
