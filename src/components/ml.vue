<template>
  <span      v-if="fr && $root.$i18n.locale=='fr'" v-html="fr"></span>
  <span v-else-if="en && $root.$i18n.locale=='en'" v-html="en"></span>
  <span v-else><slot></slot></span>
</template>

<script>
export default {
  name: 'ml',
  props: ['en','fr']
}
</script>
