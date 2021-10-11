/* eslint-disable camelcase */

<template>
  <div>
    <b-select
      :class="narrowed?'vcondensed':''"
      v-show="(alwaysVisible && isValidType) || has_models"
      v-model="computedValue"
      :disabled="disabled || !has_models"
      v-bind="$attrs"
      :size="size" >
        <option v-if="add_default" value="default">{{$t('labels.default')}}</option>
        <option v-for="(item,key) in models" :key="key" :value="key">
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
    size: { type: String, default: 'is-small' },
    item_type: { type: String, default: null },
    alwaysVisible: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  mixins: [base_selector],
  computed: {
    isValidType () {
      return this.item_type in this.devices
    },
    has_models () {
      return this.item_type in this.devices && 'models' in this.devices[this.item_type]
    },
    add_default () {
      let has_default = this.has_models && 'default' in this.devices[this.item_type].models
      return (!has_default) || ((!this.has_models) && this.alwaysVisible)
    },
    models () {
      if (this.has_models) {
        return this.devices[this.item_type].models
      } else {
        return {}
      }
    }
  },
  mounted () {
    if (this.alwaysVisible && this.isValidType && !this.has_models) {
      this.computedValue = 'default'
    }
  },
  watch: {
    item_type () {
      if (this.alwaysVisible && !this.has_models) {
        this.computedValue = 'default'
      }
    }
  }
}

</script>
