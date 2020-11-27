Vue.component('csv-processing', {
  
  props: {
    'devicelist':Array,
    'method':String,
    'damping_factor':Number
  },

  template: /*html*/`
    <div style="position:relative;" name="csv_table_block" >

    <p>
      <label>Charger une liste au format CSV :
      </label><input type="file" id="csv_file" @change="load_csv"> <span class="note">(l'affichage de la table peut prendre jusqu'à 1 minute)</span>
    </p>

    <dropdownbox title="Instructions" :show="true">
      <p>
        Cet outil s'attend à trouver 4 colonnes ayant des noms ressemblant à :
        <ul>
          <li><b>Type</b>, ex. PC fixe, laptop, etc.</li>
          <li><b>Modèle</b>, ex. Latitude 5280</li>
          <li><b>Fabricant</b>, ex. DELL, HP, Apple, etc. (optionnel, et non utilisé pour l'instant)</li>
          <li><b>Date d'achat</b>, à partir de laquelle sera extraite l'année d'achat pour une comptabilisation par flux (voir onglet <i>options</i>).</li>
        </ul>
        
      </p>

      <p>
        Code couleur :
        <ul>
          <li class="score0">Item non identifié, il faut donc les identifier à la main !</li>
          <li class="score1">Item partiellement identifié, c'est à dire que soit le <b>type</b>, soit le <b>modèle</b> a été reconnu.</li>
          <li class="score2">Item complètement identifié, ce qui n'exclu pas des faux positifs !</li>
        </ul>
      </p>
    </dropdownbox>

    <ul>
      <li>Filtrer les équipements sans date : <input v-model="filter_empty_year" type="checkbox"> </li>
      <li v-show="method=='flux'">
          Filtrer les équipements en dehors de la période d'amortissement (voir onglet <i>options</i>) : <input v-model="filter_damping_period" type="checkbox"> 
        <ul v-show="filter_damping_period">
          <li>année du bilan : <input v-model="reference_year" type="number" min="2010" max="2100" step="1"> </li>
        </ul>
      </li>
      <li>Nombre de lignes masqués :
          <span v-text="csvlist.length-csvlist.filter(d => selection_predicate(d)).length"></span></li>
      <li>Nombre de lignes valides :
          <span v-text="csvlist.filter(d => d.score>0 && selection_predicate(d)).length"></span> / <span v-text="csvlist.length"></span></li>
    </ul>

    <p>
      <label>Envoyer les données valides (items oranges et verts) pour calcul :</label>
      <input type="button" value="GO !" @click="send_to_ecodiag" > (voir onglet <i>équipement</i> pour le résumé)
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

      <tr v-for="item in csvlist.filter(d => selection_predicate(d))" :class="'score'.concat(item.score)">
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
            <option v-if="!(devices[item.type].models && devices[item.type].models.default)" value="default">{{$t('labels.default')}}</option>
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
          }.bind(this);
        }.bind(this))(file);

        reader.readAsText(file);
      }
    },
    selection_predicate(item) {
      return ( (!this.filter_empty_year) || item.year!="" )
          && ( (!(this.method=='flux' && this.filter_damping_period))
                || item.year==""
                || ( +item.year<=this.reference_year && +item.year>(this.reference_year-this.damping_factor) ) );
    },
    send_to_ecodiag(evt) {
      var copy = [];
      for(var i in this.csvlist) {
        var item = clone_obj(this.csvlist[i]);
        if( item &&  item.score>0 && selection_predicate(item) ) {
          item.key = item.type.concat(item.model);
          copy.push(item);
        }
      }
      copy = csv_merge_wrt_keys(copy);
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
      filter_empty_year: false,
      filter_damping_period: true,
      reference_year: 2019,
    }
  }

})