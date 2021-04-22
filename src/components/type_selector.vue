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
  mixins: [base_selector]
}

</script>
