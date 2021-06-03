/* eslint-disable camelcase */

<template>
  <div>
    <b-select v-if="item_type in devices && devices[item_type].models"
      v-model="computedValue"
      v-bind="$attrs"
        <option v-if="!(devices[item_type].models && devices[item_type].models.default)" value="default">{{$t('labels.default')}}</option>
        <option v-for="(item,key) in devices[item_type].models" :key="key" :value="key">
      :size="size" >
            {{tr_label(item,key)}}
        </option>
    </b-select>
  </div>
</template>

<script>

/* eslint-disable camelcase */

import base_selector from './base_selector'

export default {
  name: 'ecodiag-select-model',
  inheritAttrs: false,
  props: {
    item_type: { type: String, default: null }
    size: { type: String, default: 'is-small' },
  },
  mixins: [base_selector]
}

</script>
