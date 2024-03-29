import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { importIcons } from './icon-library';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

importIcons();

const pinia = createPinia();
const app = createApp(App).component('fa-icon', FontAwesomeIcon);

app.use(pinia);
app.mount('#app');
