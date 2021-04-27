/* eslint-disable camelcase */

<template>
  <div>
    <b-select v-model="computedValue" v-bind="$attrs" size="is-small">
        <option v-for="(item,key) in devices" :key="key" :value="key">
        {{tr_label(item,key)}}
        </option>
    </b-select>
  </div>
</template>

<script>

/* eslint-disable camelcase */

import base_selector from './base_selector'

export default {
  name: 'ecodiag-select-type',
  inheritAttrs: false,
  mixins: [base_selector],
  updated() {
    // This is required when nested wihtin a b-table:
    // if a change of the b-select element trigger a change of the b-table,
    // then this b-select element won't be properly updated
    // (because the changes occurs during an @input event of the select element)
    let self = this
    this.$nextTick(function () {
      self.selected = self.value
    })
  }
}

</script>
