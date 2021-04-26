import Vue from 'vue'
import App from './App.vue'
import messages from './i18n.js'
import VueI18n from 'vue-i18n'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import './ecodiag.css'

Vue.config.productionTip = false
Vue.use(VueI18n)
Vue.use(Buefy, {defaultIconPack: 'fa'})

Vue.component('span-en', {template: /*html*/`<span v-if="$root.$i18n.locale=='en'"><slot></slot></span>`})
Vue.component('span-fr', {template: /*html*/`<span v-if="$root.$i18n.locale=='fr'"><slot></slot></span>`})

const i18n = new VueI18n({
  locale: 'fr',
  fallbackLocale: "fr",
  messages: messages
})

new Vue({i18n,
  render: h => h(App),
}).$mount('#app')
