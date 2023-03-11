import { defineStore } from 'pinia';
import { assembleLine } from '@/service/assembling';
import { formatNumber } from '@/service/formatting';
import { useSettingsStore } from '@/stores/settings';
import { lexNeverFail } from '@/service/assembler/lexer';
import { useCpuStore } from './cpu';

interface ErrorReport {
    lineNumber: number;
    errorMessage: string;
}

interface CodeState {
    code: string;
    activeLineIndex: number;
    assembledCode: number[];
    // Whether the code has been edited since last assembling.
    isDirty: boolean;
    errors: ErrorReport[];
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
    return `<span class=${className}>${
        doSanitize ? sanitize(text) : text
    }</span>`;
}

export const useCodeStore = defineStore('code', {
    state: (): CodeState => ({
        code: '',
        activeLineIndex: 0,
        assembledCode: [],
        isDirty: false,
        errors: [],
    }),
    getters: {
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
                if (isActiveLine) {
                    highlightedCode += getSpan(
                        'active-line',
                        lineContent.length > 0 ? lineContent : '\n',
                        false
                    );
                } else {
                    highlightedCode += lineContent + '\n';
                }
            }
            return highlightedCode;
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
