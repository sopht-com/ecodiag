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

    <div id="csvtable">
    <b-table
      v_if="csvlist.length>0"
      :data="csvdata" 
      :hoverable="true"
      :sort-icon="'sui-angle-up'"
      default-sort="score"
      :row-class="(row, index) => 'score'.concat(row.score)"
      paginated
      per-page="200"
    >

      <b-table-column :field="csvlist.header_map.in_brand" sortable :label="$t('words.brand')" v-slot="props">
        <span class="unit">{{ props.row[csvlist.header_map.in_brand] }}</span>
      </b-table-column>

      <b-table-column :field="csvlist.header_map.in_type" sortable :label="$t('words.type')" v-slot="props">
        <span class="unit">{{ props.row[csvlist.header_map.in_type] }}</span>
      </b-table-column>

      <b-table-column :field="csvlist.header_map.in_model" sortable :label="$t('words.model')" v-slot="props">
        <span class="unit">{{ props.row[csvlist.header_map.in_model] }}</span>
      </b-table-column>

      <b-table-column :field="csvlist.header_map.in_date" sortable :label="$t('words.date')" v-slot="props">
        <span class="unit">{{ props.row[csvlist.header_map.in_date] }}</span>
      </b-table-column>

      <b-table-column field="nb" width="10" cell-class="transparent" header-class="transparent" v-slot="props">
      <span class="unit"></span>
      </b-table-column>

      <b-table-column field="type" sortable :label="$t('words.type')" v-slot="props">
        <b-select v-model="props.row.type" @input="item_type_changed(props.row)" size="is-small">
          <option v-for="d in Object.keys(devices)" :value="d">
            {{tr(d)}}
          </option>
        </b-select>
      </b-table-column>

      <b-table-column field="model" sortable :label="$t('words.model')" v-slot="props">
        <b-select v-if="props.row.type in devices && devices[props.row.type].models" v-model="props.row.model" @input="item_model_changed(props.row)" size="is-small" >
            <option v-if="!(devices[props.row.type].models && devices[props.row.type].models.default)" value="default">{{$t('labels.default')}}</option>
            <option v-for="m in Object.keys(devices[props.row.type].models)" :value="m">
              {{tr(m)}}
            </option>
        </b-select>

      </b-table-column>

      <b-table-column field="year" sortable :label="$t('words.purchase_year')" numeric v-slot="props">
        <b-input v-model="props.row.year" type="number" min="1900" max="2100" step="1" size="is-small" custom-class="year-picker" />
      </b-table-column>

      <b-table-column field="nb" sortable :label="$t('words.quantity')" numeric v-slot="props">
        <span class="unit">{{ props.row.nb }}</span>
      </b-table-column>

    </b-table>
    </div>

  </div>
  `,
  mixins: [device_utils],
  computed: {
    csvdata: function() {
      return this.csvlist.filter(d => this.selection_predicate(d))
    }
  },
  updated() {
    this.add_supheader()
  },
  methods:{
    
    tr(l) {
      var key = 'labels.'+l;
      if(this.$te(key))
        return this.$t(key);
      return l;
    },
    item_type_changed: function(item) {
      item.model = this.get_default_model(item.type);
      item.score = 2;
      this.item_model_changed(item);
    },
    item_model_changed: function(item) {
      item.lifetime   = this.get_device_attribute(item.type,item.model,'duration');
      item.lifetime2  = item.lifetime*1.5;
      item.score=2;
      item.yearly_consumption = this.get_device_attribute(item.type,item.model,'yearly_consumption');
    },
    load_csv: function(evt) {
      var files = evt.target.files;
      if(files.length==1) {
        var file = files[0];
        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            this.csvlist = this.parse_raw_csv(e.target.result);
          }.bind(this);
        }.bind(this))(file);

        reader.readAsText(file);
      }
      
    },
    add_supheader() {
      if(!this.header_added) {
        var dt = document.getElementById("csvtable")
        // console.log(dt)
        var t = dt.getElementsByTagName("table")
        
        if(t.length>0) {
          // console.log(t[0])
          var thead = t[0].getElementsByTagName('thead')[0]
          // console.log(thead)
          this.header_added = true
          thead.innerHTML = '<tr><th colspan="4">Entrées utilisateurs</th><th class="transparent"></th><th colspan="4">Ecodiag</th></tr>' + thead.innerHTML
        }
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
        if( item &&  item.score>0 && this.selection_predicate(item) ) {
          item.key = item.type.concat(item.model);
          copy.push(item);
        }
      }
      copy = this.csv_merge_wrt_keys(copy);
      this.devicelist.splice(0,this.devicelist.length);
      for(var i in copy) {
        var item = copy[i];
        this.devicelist.push( this.consolidate_device_item(item.type, item.model, item) );
      }
    }
  },
  data() {
    var csv_data = []
    csv_data['header_map'] = {
      in_brand: 'Fabricant',
      in_type: 'Type',
      in_model: 'Modèle',
      in_date:  'Date d\'achat'
    }
    return {
      // import global data and functions:
      devices: devices,
      toFixed: toFixed,
      csvlist: csv_data,
      filter_empty_year: false,
      filter_damping_period: true,
      reference_year: 2019,
      header_added: false
    }
  }

})