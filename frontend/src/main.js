import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { createPinia } from 'pinia';

const pinia = createPinia();

app.use(pinia);
createApp(App).use(router).mount('#app');
