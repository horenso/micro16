import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            numberSystem: 2,
            paddWithZeros: false
        }
    }
});