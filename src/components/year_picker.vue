<template>
  <div class="year-picker">
    <b-select
      v-model="computedValue"
      v-bind="$attrs"
      size="is-small">
      <option value=""></option>
      <option
        v-for="year in listOfYears"
        :value="year"
        :key="year">
        {{ year }}
      </option>
      <option value=""></option>
    </b-select>
  </div>
</template>

<script>

/* eslint-disable camelcase */

import base_selector from './base_selector'

export default {
  name: 'ecodiag-select-year',
  inheritAttrs: false,
  props: {
    minYear: { type: Number, default: null },
    maxYear: { type: Number, default: null }
  },
  mixins: [base_selector],
  computed: {
    listOfYears () {
      let latestYear = this.maxYear ? this.maxYear : this.computedValue + 20
      let earliestYear = this.minYear ? this.minYear : this.computedValue - 20
      const arrayOfYears = []
      for (let i = earliestYear; i <= latestYear; i++) {
        arrayOfYears.push(i)
      }
      return arrayOfYears.reverse()
    }
  }
}

</script>

<style>
/* remove the arrow (for compactness) */
.year-picker .control .select::after {
  display: none
}
.year-picker .control .select select {
  padding-right: 10px
}
.year-picker .control .select select option {
  padding-right: 5rem
}
</style>
