import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/styles/theme.less'
import Icon from "./components/Icon.vue";
import 'virtual:svg-icons-register'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.component('Icon', Icon);
app.mount('#app')
