
Vue.component('span-en', {template: /*html*/`<span v-if="$root.$i18n.locale=='en'"><slot></slot></span>`})

Vue.component('span-fr', {template: /*html*/`<span v-if="$root.$i18n.locale=='fr'"><slot></slot></span>`})

Vue.component('ml', {
  props: ['en','fr'],
  template: /*html*/`
      <span      v-if="fr && $root.$i18n.locale=='fr'" v-html="fr"></span>
      <span v-else-if="en && $root.$i18n.locale=='en'" v-html="en"></span>
      <span v-else><slot></slot></span>`
})

