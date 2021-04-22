
/* eslint-disable */

import { devices } from '../devices.js'
import { device_utils } from '../device_utils'
import messages from '../i18n'

export default {
  props: {
    value: {
      type: [String, Number, Boolean, Object, Array, Function],
      default: null
    }
  },

  mixins: [device_utils],
  i18n: {
    sharedMessages: messages
  },

  data () {
    return {
      devices: devices,
      selected: this.value
    }
  },
  computed: {
    computedValue: {
      get () {
        return this.selected
      },
      set (value) {
        this.selected = value
        this.$emit('input', value)
      }
    }
  },
  watch: {
    value (value) {
      this.selected = value
    }
  }
}
