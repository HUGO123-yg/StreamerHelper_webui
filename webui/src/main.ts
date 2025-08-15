import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import JsonEditorVue from 'json-editor-vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.component('json-editor-vue', JsonEditorVue)

app.mount('#app')