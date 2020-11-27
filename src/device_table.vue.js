Vue.component('device-table', {
  
  props: {
    'devicelist':Array,
    'method':String
  },

  template: /*html*/`
  <div style="position:relative;" name="devices_table_block" >
          
    <input type="button" value="+" name="devices_add_row" style="position: absolute;bottom: 2px;"
            @click="add_new_item('desktop')" >
    
    <table name="devices_table" style="margin-left:2em;">

      <tr>
        <th class="transparent" colspan="4"></th>
        <th v-show="method=='stock'" colspan="2">{{$t('words.lifetime')}}</th> 
        <th v-show="method=='stock'" class="transparent"></th>
        <th>{{$t('words.use')}}</th>
        <th class="transparent"></th>
        <th colspan="2">kgCO2e/
          <select v-model="normalization">
            <option v-for="key in normalization_list" :value="key">
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
        <th v-show="method=='stock'">{{$t('words.actual')}}</th>
        <th v-show="method=='stock'">{{$t('words.objective')}}</th>
        <th v-show="method=='stock'" class="transparent"></th>
        <th><span style="font-size:85%">kWh/{{$t('words.year')}}/{{$t('words.unit')}}</span></th>
        <th class="transparent"></th>
        <th>{{$t('words.fabrication')}}</th>
        <th>{{$t('words.use')}}</th>
      </tr>

      <tr v-for="item in devicelist">
        
        <td>
          <select v-model="item.type" @change="item_type_changed(item)">
            <option v-for="d in Object.keys(devices)" :value="d">
              {{tr(d)}}
            </option>
          </select>
        </td>

        <td>
          <select v-if="devices[item.type].models" v-model="item.model" @change="item_model_changed(item)">
            <option v-if="!(devices[item.type].models && devices[item.type].models.default)" value="default">{{$t('labels.default')}}</option>
            <option v-for="m in Object.keys(devices[item.type].models)" :value="m">
              {{tr(m)}}
            </option>
          </select>
        </td>

        <td><input v-model="item.nb" type="number" min="0" max="99999" style="width:3.5em" step="1" /></td>
        <td class="transparent"></td>
        <td v-show="method=='stock'">
          <input v-model="item.lifetime"  type="number" min="0.5"   max="99" style="width:3em" step="0.5"
            @change="function() {if(!item.lifetime_unlocked) item['lifetime2'] = item.lifetime*1.5;}"  />
        </td>
        <td v-show="method=='stock'">
          <locked :onchange="function(x) { item['lifetime_unlocked']=x;}">
            <input v-model="item.lifetime2" type="number" min="0.5" max="99" style="width:3em" step="0.5" disabled />
          </locked>
        </td>
        <td v-show="method=='stock'" class="transparent"></td>
        <td>
          <locked>
            <input v-model="item.yearly_consumption" type="number" min="0" max="999999" style="width:3.5em;text-align: right;" step="1" disabled />
          </locked>
        </td>
        <td class="transparent"></td>
        <td>
          <span class="unit">{{ 
            (normalization=='year'
              ? toFixed(item.nb * get_device_factor(item.type,item.model).mean / item.lifetime,0)
              : toFixed(get_device_factor(item.type,item.model).mean,0)) }}</span>
        </td>
        <td>
          <span class="unit">{{
            (normalization=='year'
              ? toFixed(item.nb * get_yearly_consumption(item) * conv.to_CO2.elec , 1)
              : toFixed(item.lifetime * get_yearly_consumption(item) * conv.to_CO2.elec)) }}</span>
        </td>
      </tr>
        
    </table>
  </div>
  `,
  methods:{
    tr(l) {
      var key = 'labels.'+l;
      if(this.$te(key))
        return this.$t(key);
      return l;
    },
    add_new_item: function(type) {
      var item = {type:type, model:null, nb:1, lifetime: null, lifetime2:null};
      this.item_type_changed(item);
      this.devicelist.push(item);
    },
    item_type_changed: function(item) {
      item.model      = get_default_model(item.type);
      this.item_model_changed(item);
    },
    item_model_changed: function(item) {
      item.lifetime   = get_device_attribute(item.type,item.model,'duration');
      item.lifetime2  = item.lifetime*1.5;
      item.yearly_consumption = get_device_attribute(item.type,item.model,'yearly_consumption');
    },
  },
  data() {
    return {
      // import global data and functions:
      devices:devices,
      toFixed:toFixed,
      get_device_factor:get_device_factor,
      get_device_attribute:get_device_attribute,
      get_yearly_consumption:get_yearly_consumption,
      conv:conv,
      normalization_list:['year','unit'],
      normalization:'year',
    }
  }

})