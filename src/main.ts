import components from '@/components'
import layouts from '@/layouts/components'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'

const pinia = createPinia()
pinia.use(createPersistedState({ storage: localStorage, auto: true }))
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(layouts)
app.use(components, ['Settings', 'NxTerminal'])
app.mount('#app').$nextTick(window.$loading.end)
