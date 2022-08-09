import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/tailwind.css";

import mitt from "mitt";
const emitter = mitt();

const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.provide("emitter", emitter);
app.use(createPinia());
app.use(router);
app.mount("#app");
