/**
 * @module main
 * @description Application entry point. Creates the Vue 3 app instance,
 * installs plugins (Pinia, Router), imports global styles, and mounts
 * the application to the DOM.
 * @category Presentation
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './presentation/router';
import './presentation/styles/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
