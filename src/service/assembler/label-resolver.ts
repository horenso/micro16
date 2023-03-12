import { EmptyOk, EmptyResult, Err, Ok, Result } from '@/service/result-type';
import { Token } from './token';

export function resolveDefinitionLabel(
    lineTokens: Token[],
    lineNumber: number,
    labels: Map<string, number>
): void {
    const lastToken = lineTokens[lineTokens.length - 1];
    if (lastToken?.type === 'LABEL_DEFINE') {
        labels.set(lastToken.label, lineNumber);
        lineTokens.pop();
    }
}

export function resolveTargetLabels(
    lineTokens: Token[],
    labels: Map<string, number>
): EmptyResult {
    for (let i = 0; i < lineTokens.length; ++i) {
        const token = lineTokens[i];
        if (token.type === 'LABEL_TARGET') {
            const address = labels.get(token.label);
            if (address === undefined) {
                return Err(`Label ${token.label} not found.`);
            }
            lineTokens[i] = {
                type: 'JUMP_ADDRESS',
                number: address,
                text: token.text,
            };
        }
    }
    return EmptyOk();
}
