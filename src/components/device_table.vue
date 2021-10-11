
<template>
  <div style="position:relative;" name="devices_table_block" >

    <input v-if="is_listening_add_item"
      type="button" value="+" name="devices_add_row" style="position: absolute;bottom: 2px;"
            @click="add_new_item('desktop')" >

    <table name="devices_table" class="table condensed" style="margin-left:2em;">

      <tr v-if="method=='stock' && show_usage">
        <th class="transparent" colspan="4"></th>
        <th v-show="method=='stock'" colspan="2">{{$t('words.lifetime')}}</th>
        <th v-show="method=='stock'" class="transparent"></th>
        <th v-if="method=='stock' && show_usage">{{$t('words.use')}}</th>
        <th class="transparent"></th>
        <th colspan="2">kgCO2e/
          <select v-model="normalization">
            <option v-for="key in normalization_list" :key="key" :value="key">
              {{$t('words.'+key)}}
            </option>
          </select>
        </th>
      </tr>
      <tr>
        <th class="transparent"></th>
        <th>{{$t('words.model')}}</th>
        <th>{{$t('words.quantity')}}</th>
        <th class="transparent"></th>
        <th v-if="method === 'stock'">{{$t('words.actual')}}</th>
        <th v-if="method === 'stock'">{{$t('words.objective')}}</th>
        <th v-if="method === 'stock'" class="transparent"></th>
        <th v-if="method=='stock' && show_usage"><span style="font-size:85%">kWh/{{$t('words.year')}}/{{$t('words.unit')}}</span></th>
        <th class="transparent"></th>
        <th>{{$t('words.fabrication')}}</th>
        <th v-if="method=='stock' && show_usage">{{$t('words.use')}}</th>
      </tr>

      <tr v-for="(item,idx) in devicelist" :key="idx">

        <td>
          <ecodiag-select-type expanded v-model="item.type" >
          </ecodiag-select-type>
        </td>

        <td>
          <ecodiag-select-model expanded v-model="item.model" :item_type="item.type" >
          </ecodiag-select-model>
        </td>

        <td><input v-model="item.nb" type="number" min="0" max="99999" style="width:3.5em" step="1" /></td>
        <td class="transparent"></td>
        <td v-if="method=='stock'">
          <input v-model="item.lifetime"  type="number" min="0.5"   max="99" style="width:3em" step="0.5"
            @change="function () { if (!item.lifetime_unlocked) item['lifetime2'] = item.lifetime * 1.5 }"  />
        </td>
        <td v-if="method=='stock'">
          <locked :onchange="function (x) { item['lifetime_unlocked'] = x }">
            <input v-model="item.lifetime2" type="number" min="0.5" max="99" style="width:3em" step="0.5" disabled />
          </locked>
        </td>
        <td v-if="method=='stock'" class="transparent"></td>
        <td v-if="method=='stock' && show_usage">
          <locked>
            <input v-model="item.yearly_consumption" type="number" min="0" max="999999" style="width:3.5em;text-align: right;" step="1" disabled />
          </locked>
        </td>
        <td class="transparent"></td>
        <td>
          <span class="unit">{{
            (normalization === 'year'
              ? Math.round(item.nb * get_device_factor(item.type,item.model).mean / (method=='stock' ? item.lifetime : params.damping_factor), 0)
              : Math.round(get_device_factor(item.type,item.model).mean, 0)) }}</span>
        </td>
        <td v-if="method=='stock' && show_usage">
          <span class="unit">{{
            (normalization=='year'
              ? toFixed(item.nb * get_yearly_consumption(item) * kWh_to_CO2e, 1)
              : toFixed(item.lifetime * get_yearly_consumption(item) * kWh_to_CO2e)) }}</span>
        </td>
      </tr>

    </table>
  </div>
</template>

<script>

/* eslint-disable camelcase */

import { devices } from './devices'
import { device_utils } from './device_utils'
import { messages } from './i18n'

export default {
  name: 'ecodiag-device-table',

  emits: [ 'addItem' ],

  props: {
    'devicelist': Array,
    'method': { type: String, default: 'flux' },
    'kWh_to_CO2e': { type: Number, default: 0.084 },
    'show_usage': { type: Boolean, default: true }
  },

  components: {
    'ecodiag-select-type': () => import('./type_selector.vue'),
    'ecodiag-select-model': () => import('./model_selector.vue')
  },

  i18n: {
    sharedMessages: messages
  },

  mixins: [device_utils],
  computed: {
    is_listening_add_item () {
      return Boolean(this.$listners) && Boolean(this.$listners.addItem)
    }
  },
  methods: {
    tr (l) {
      var key = 'labels.' + l
      if (this.$te(key)) { return this.$t(key) }
      return l
    },
    add_new_item: function (type) {
      let item = this.create_device_item(type)
      this.devicelist.push(item)
    }
  },
  data () {
    return {
      devices: devices,
      normalization_list: ['year', 'unit'],
      normalization: 'year'
    }
  }

}

</script>

<style scoped lang="css">
td.transparent , th.transparent{
  background-color: white;
  border-bottom: 1px solid white;
}

th select {
  background-color: #d9b38c;
  font-weight: bold;
}
</style>
