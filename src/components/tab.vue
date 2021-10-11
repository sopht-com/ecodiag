<template>
  <div v-show="isActive"><slot></slot></div>
</template>

<script>
export default {
  name: 'tab',

  props: {
    name: { required: true },
    selected: { default: false },
    'button-style': { default: '' }
  },
  data () { return { isActive: false } },
  computed: {
    href () {
      return '#' + this.name.toLowerCase().replace(/ /g, '-')
    }
  },
  mounted () { this.isActive = this.selected }
}
</script>
