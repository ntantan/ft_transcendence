import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import VueCookies from 'vue-cookies';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { MotionPlugin } from "@vueuse/motion";

loadFonts();

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
const app = createApp(App);

app.use(MotionPlugin);

app.use(router).use(vuetify).use(VueCookies).use(pinia).mount("#app");
