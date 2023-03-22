import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            numberSystem: 16,
            frequency: 1,
            showAssembly: true,
        };
    },
});
