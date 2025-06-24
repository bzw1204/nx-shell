import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import settings from './components/settings/index.vue'
import terminal from './components/terminal/index.vue'
import layouts from './layouts/components'
import router from './router'
import 'virtual:uno.css'

const pinia = createPinia()
pinia.use(createPersistedState({ storage: localStorage, auto: true }))
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(layouts)
app.component('settings', settings)
app.component('terminal', terminal)
app.mount('#app').$nextTick(window.$loading.end)
