Vue.component('csv-processing', {
  
  props: {
    'devicelist':Array,
  },

  template: /*html*/`
    <div style="position:relative;" name="csv_table_block" >

    <p>
      <label>Charger une liste au format CSV :
      </label><input type="file" id="csv_file" @change="load_csv"> <br/>
      Attention, l'affichage de la table peut prendre jusqu'à 1 minute si le nombre d'entrées uniques est très grand.
    </p>

    <p>
      <label>Envoyer les données valides (items oranges et verts) à ecodiag:</label>
      <input type="button" value="GO !" @click="send_to_ecodiag" >
    </p>
    
    <table name="csv_table" class="csv_table">

      <tr>
        <th colspan="4">Entrées utilisateurs</th>
        <th class="transparent"></th>
        <th colspan="4">Ecodiag</th>
        
      </tr>
      <tr>
        <th>{{$t('words.brand')}}</th>
        <th>{{$t('words.type')}}</th>
        <th>{{$t('words.model')}}</th>
        <th>{{$t('words.date')}}</th>
        <th class="transparent"></th>
        <th>{{$t('words.type')}}</th>
        <th>{{$t('words.model')}}</th>
        <th>{{$t('words.purchase_year')}}</th>
        <th>{{$t('words.quantity')}}</th>
      </tr>

      <tr v-for="item in csvlist" :class="'score'.concat(item.score)">
        <td>
          <span class="unit">{{ item[csvlist.header_map.in_brand] }}</span>
        </td>
        <td>
          <span class="unit">{{ item[csvlist.header_map.in_type] }}</span>
        </td>
        <td>
          <span class="unit">{{ item[csvlist.header_map.in_model] }}</span>
        </td>
        <td>
          <span class="unit">{{ item[csvlist.header_map.in_date] }}</span>
        </td>

        <td class="transparent"></td>

        <td>
          <select v-model="item.type" @change="item_type_changed(item)">
            <option v-for="d in Object.keys(devices)" :value="d">
              {{tr(d)}}
            </option>
          </select>
        </td>
        <td>
          <select v-if="item.type in devices && devices[item.type].models" v-model="item.model" @change="item_model_changed(item)">
            <option value="default">{{$t('labels.default')}}</option>
            <option v-for="m in Object.keys(devices[item.type].models)" :value="m">
              {{tr(m)}}
            </option>
          </select>
        </td>
        <td>
          <input v-model="item.year" type="number" min="1900" max="2100" style="width:3.5em" step="1" />
        </td>
        <td>
          <span class="unit">{{ item.nb }}</span>
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
    item_type_changed: function(item) {
      item.model      = get_default_model(item.type);
      item.score=2;
      this.item_model_changed(item);
    },
    item_model_changed: function(item) {
      item.lifetime   = get_device_attribute(item.type,item.model,'duration');
      item.lifetime2  = item.lifetime*1.5;
      item.score=2;
      item.yearly_consumption = get_device_attribute(item.type,item.model,'yearly_consumption');
    },
    load_csv: function(evt) {
      var files = evt.target.files;
      if(files.length==1) {
        var file = files[0];
        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            this.csvlist = parse_raw_csv(e.target.result);
            // console.log(this.csvlist);
          }.bind(this);
        }.bind(this))(file);

        reader.readAsText(file);
      }
    },
    send_to_ecodiag(evt) {
      var copy = [];
      for(var i in this.csvlist) {
        var item = clone_obj(this.csvlist[i]);
        if(item && item.score>0) {
          item.key = item.type.concat(item.model);
          copy.push(item);
        }
      }
      console.log(clone_obj(copy));
      copy = csv_merge_wrt_keys(copy);
      console.log(clone_obj(copy));
      this.devicelist.splice(0,this.devicelist.length);
      for(var i in copy) {
        var item = copy[i];
        this.devicelist.push( consolidate_device_item(item.type, item.model, item) );
      }
    }
  },
  data() {
    return {
      // import global data and functions:
      devices:devices,
      toFixed:toFixed,
      get_device_attribute:get_device_attribute,
      csvlist:[],
    }
  },
  // onmount() {
      // function handle_team_officeway_csv_file_select(files) {
        
      // }
  
      // document.getElementById('team_officeway_csv_file').addEventListener('change', function(evt) { return handle_team_officeway_csv_file_select(evt.target.files); }, false);
  // }

})