import { defineStore } from 'pinia';
import { assembleLine } from '../service/assembling';
import { formatNumber } from '../service/formatting';
import { useSettingsStore } from './settings';

export const useCodeStore = defineStore('code', {
    state: () => ({
        code: "",
        isDirty: true,
        assembledCode: []
    }), getters: {
        assembledCodeString: (state) => {
            return state.assembledCode.map(code => formatNumber(code, useSettingsStore().numberSystem, 32)).join('\n');
        }
    }, actions: {
        assemble() {
            if (this.code === "") {
                this.assembledCode = []
                return;
            }
            let newAssembledCode: any = [];
            const lines = this.code.split('\n');
            // Remove the last empty line
            // "a\nb\n" should become ["a","b"] not [a,b,""]
            if (lines[lines.length-1] == '') {
                lines.pop();
            }
            lines.forEach(line => {
                newAssembledCode.push(assembleLine(line));
            });
            this.assembledCode = newAssembledCode;
            console.log(this.assembledCode);
        },
    }
});