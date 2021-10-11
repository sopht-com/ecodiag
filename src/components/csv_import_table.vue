
<template>
  <div name="csv_table_block" >

    <!-- <p>
      <label>Charger une liste au format CSV :
      </label><input type="file" id="csv_file" @change="load_csv"> <span class="note">(l'affichage de la table peut prendre jusqu'à 1 minute)</span>
    </p> -->

    <!-- <ul>
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
    </ul> -->

    <!-- <p>
      <label>Envoyer les données valides (items oranges et verts) pour calcul :</label>
      <input type="button" value="GO !" @click="send_to_ecodiag" > (voir onglet <i>équipement</i> pour le résumé)
    </p> -->

    <b-modal
      :active.sync="show_nb_screen_modal"
      has-modal-card
      :can-cancel="['escape', 'x']"
    >
      <div class="modal-card" style="width: 800px; height: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">La liste fournie ne contient aucun écran !</p>
        </header>
        <section class="modal-card-body">
          <div class="block">Choisissez une des options suivantes :</div>
          <table class="table is-striped is-hoverable is-fullwidth">
            <tr :class="nb_screen_method === 'from_nb_PCs' ? 'is-selected' : ''">
                <td class="vcenter">
                  <b-field>
                    <b-radio v-model="nb_screen_method"
                        native-value="from_nb_PCs">
                    </b-radio>
                  </b-field>
                </td>
                <td>
                  Comptabiliser en moyenne :<br/>
              <input v-model.number="nb_screens_per_desktop" type="number" min="0" max="10" step="0.1" size="is-small" class="inline-number w3" /> écran acheté par PC-fix acheté, et<br/>
              <input v-model.number="nb_screens_per_laptop" type="number" min="0" max="10" step="0.1" size="is-small" class="inline-number w3" /> écran acheté par portable acheté, <br/>
              soit une estimation de <strong>{{nb_estimated_screens('from_nb_PCs')}}</strong> écrans achetés sur la période.
                </td>
              </tr>
            <tr :class="nb_screen_method === 'from_nb_users' ? 'is-selected' : ''">
              <td class="vcenter">
                <b-field>
                  <b-radio v-model="nb_screen_method"
                        native-value="from_nb_users">
                  </b-radio>
                </b-field>
              </td>
              <td>
                Comptabiliser
                <input v-model.number="nb_users_actual" type="number" min="0" max="99999" step="1" size="is-small" class="inline-number w5" />
                agents, avec en moyenne
                <input v-model.number="nb_screens_per_user" type="number" min="0" max="10" step="0.1" size="is-small" class="inline-number w3" />
                écrans par agent,<br/> et une durée de vie moyenne de
                <input v-model.number="screen_lifetime" type="number" min="1" max="99" step="0.5" size="is-small" class="inline-number w4" /> années,<br/>
                soit une estimation de <strong>{{nb_estimated_screens('from_nb_users')}}</strong> écrans achetés sur la période.
              </td>
            </tr>
            <tr :class="nb_screen_method === 'none' ? 'is-selected' : ''">
              <td class="vcenter">
                <b-field>
                  <b-radio v-model="nb_screen_method" native-value="none">
                  </b-radio>
                </b-field>
              </td>
              <td>
                Aucun écran acheté sur la période, ou bien je rajoute moi même les écrans via le bouton "ajouter" en bas du tableau.
              </td>
            </tr>
          </table>
        </section>

        <footer class="modal-card-foot">
          <b-button label="OK" type="is-primary" @click="$emit('close');show_nb_screen_modal=false" />
        </footer>
      </div>
    </b-modal>

    <div class="columns is-multiline">

      <div class="column is-5">
        <article v-show="csvlist.length > 0" class="notification">
          <div class="block">Nombre d'items reconnus : <strong>{{count_items(e => e.score>0)}}</strong> / <strong>{{count_items(e => true)}}</strong>, dont :</div>
          <table class="table is-fullwidth condensed">
            <tr><td>Serveurs reconnus :</td><td>{{count_items(e => e.type === 'server')}}</td><td></td></tr>
            <tr><td>PC fixes reconnus :</td><td>{{count_items(e => e.type === 'desktop')}}</td><td></td></tr>
            <tr><td>Portables reconnus :</td><td>{{count_items(e => e.type === 'laptop')}}</td><td></td></tr>
            <tr v-if="nb_screens_in_csv > 0"><td>
              Ecrans reconnus :</td><td>{{count_items(e => e.type === 'screen')}}
            </td><td></td></tr>
            <tr v-else><td>
              Ecrans <strong>estimés</strong> :</td><td>{{nb_estimated_screens()}}</td>
              <td>
                  <b-button size="is-tiny" @click="show_nb_screen_modal=true">
                    <i class="sui sui-pencil" style="font-size: 16px;"></i>
                  </b-button>
              </td>
            </tr>
        </table>
          <button type="submit" @click="validate_import" class="button is-primary">
            <!-- <span class="icon is-small"><i class="sui sui-check"></i></span> -->
            <span>Valider l'import et aller au résumé</span>
            <span class="icon"><i class="sui sui-chevron-circle-right"></i></span>
          </button>
        </article>
      </div>

      <div class="column is-3">
        <b-upload
          v-model="dropFile"
          drag-drop
          expanded
          type="is-info"
        >
          <section class="section">
            <div class="content has-text-centered">
              <p>
                <span class="icon">
                  <i style="font-size: 36px" class="sui sui-upload"></i>
                </span>
              </p>
              <p>
                Téléverser un fichier (.csv) <br/>
              </p>
            </div>
          </section>
        </b-upload>
      </div>
    </div>

    <div id="csvtable">
    <b-table
      v_if="csvlist.length>0"
      :data="csvdata"
      :hoverable="true"
      :sort-icon="'sui-angle-up'"
      default-sort="score"
      :row-class="(row, index) => 'score'.concat(row.score)"
      paginated
      narrowed
      per-page="200"
    >

      <b-table-column field="score" sortable label="-">
        <span></span>
      </b-table-column>

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

      <b-table-column width="10" cell-class="transparent" header-class="transparent" >
      <span class="unit"></span>
      </b-table-column>

      <b-table-column field="type" sortable :label="$t('words.type')" v-slot="props">
        <ecodiag-select-type expanded v-model="props.row.type" @input="item_type_changed(props.row)">
        </ecodiag-select-type>
      </b-table-column>

      <b-table-column field="model" sortable :label="$t('words.model')" v-slot="props">
        <ecodiag-select-model expanded v-model="props.row.model" :item_type="props.row.type" @input="item_model_changed(props.row)">
        </ecodiag-select-model>
      </b-table-column>

      <b-table-column field="year" sortable :label="$t('words.purchase_year')" numeric v-slot="props">
        <b-input v-model="props.row.year" type="number" min="1900" max="2100" step="1" size="is-small" custom-class="inline-number w5" />
      </b-table-column>

      <b-table-column field="nb" sortable :label="$t('words.quantity')" numeric v-slot="props">
        <span class="unit">{{ props.row.nb }}</span>
        <button class="trash is-small has-text-grey" @click="delete_row(props.row)" >
          <i class="sui sui-trash" style="font-size: 16px;"></i>
        </button>
      </b-table-column>

      <section slot="empty" class="section">
        <div class="content has-text-grey has-text-centered">
          <p>
            <i class="sui sui-ban" style="font-size: 64px;"></i>
          </p>
          <p>Aucun item</p>
        </div>
      </section>

    </b-table>
    </div>

  </div>
</template>

<script>

/* eslint-disable camelcase */

import { devices } from './devices'
import { device_utils } from './device_utils'
import { messages } from './i18n'

export default {
  name: 'ecodiag-csv-import-table',

  components: {
    'ecodiag-select-type': () => import('./type_selector.vue'),
    'ecodiag-select-model': () => import('./model_selector.vue')
  },

  props: {
    'devicelist': Array,
    'method': { type: String, default: 'flux' },
    'damping_factor': { type: Number, default: 1 },
    'nb_users': Number,
    'reference_year': { type: Number, default: 2020 }
  },

  i18n: {
    sharedMessages: messages
  },

  mixins: [device_utils],

  computed: {
    csvdata: function () {
      return this.csvlist.filter(d => this.selection_predicate(d))
    }
  },

  updated () {
    this.add_supheader()
  },

  methods: {

    count_items: function (filter) {
      return this.csvdata.filter(filter).reduce((r, e) => r + e.nb, 0)
    },

    nb_estimated_screens: function (method) {
      if (!method) {
        method = this.nb_screen_method
      }
      let round = x => Math.round(x * 10) / 10
      if (method === 'from_nb_PCs') {
        return round(this.count_items(e => e.type === 'desktop') * this.nb_screens_per_desktop +
                     this.count_items(e => e.type === 'laptop') * this.nb_screens_per_laptop)
      } else if (method === 'from_nb_users') {
        return round(this.nb_users_actual * this.nb_screens_per_user / this.screen_lifetime * this.damping_factor)
      } else {
        return this.count_items(e => e.type === 'screen')
      }
    },

    delete_row: function (item) {
      item.score = -1
    },

    item_type_changed: function (item) {
      item.score = 2
    },
    item_model_changed: function (item) {
      item.score = 2
    },
    load_csv: function (file) {
      var reader = new FileReader()

      reader.onload = (function (theFile) {
        return function (e) {
          this.csvlist = this.parse_raw_csv(e.target.result)
        }.bind(this)
      }.bind(this))(file)

      reader.readAsText(file)

      if (this.nb_users > 0 && this.nb_users_actual === 0) {
        this.nb_users_actual = this.nb_users
      }
      this.nb_screens_in_csv = this.count_items(e => e.type === 'screen')
      if (this.nb_screens_in_csv === 0) {
        this.nb_screen_method = 'from_nb_PCs'
        this.show_nb_screen_modal = true
      }
    },

    add_supheader () {
      if (!this.header_added) {
        var dt = document.getElementById('csvtable')
        var t = dt.getElementsByTagName('table')

        if (t.length > 0) {
          var thead = t[0].getElementsByTagName('thead')[0]
          this.header_added = true
          thead.innerHTML = '<tr><th colspan="4">Entrées utilisateurs</th><th class="transparent"></th><th colspan="4">Ecodiag</th></tr>' + thead.innerHTML
        }
      }
    },

    selection_predicate (item) {
      return (item.score >= 0) &&
          ((!this.filter_empty_year) || item.year !== '') &&
          ((!(this.method === 'flux' && this.filter_damping_period)) ||
                item.year === '' ||
                (+item.year <= this.reference_year && +item.year > (this.reference_year - this.damping_factor)))
    },

    validate_import () {
      var copy = []
      for (let i in this.csvlist) {
        let item = this.clone_obj(this.csvlist[i])
        if (item && (item.score > 0) && this.selection_predicate(item)) {
          item.key = item._type.concat(item._model)
          copy.push(item)
        }
      }
      copy = this.csv_merge_wrt_keys(copy)
      this.devicelist.splice(0, this.devicelist.length)
      for (let i in copy) {
        let item = copy[i]
        this.devicelist.push(this.create_device_item(item._type, { model: item._model, nb: item.nb }))
      }
      this.$emit('validate-import')
    }
  },

  watch: {
    dropFile: function () {
      this.load_csv(this.dropFile)
    }
  },

  data () {
    var csv_data = []
    csv_data['header_map'] = {
      in_brand: 'Fabricant',
      in_type: 'Type',
      in_model: 'Modèle',
      in_date: 'Date d\'achat'
    }
    return {
      dropFile: {},
      devices: devices,
      csvlist: csv_data,
      filter_empty_year: false,
      filter_damping_period: true,
      header_added: false,
      nb_screens_in_csv: 0,
      show_nb_screen_modal: false,
      nb_screen_method: 'none',
      nb_screens_per_desktop: '1',
      nb_screens_per_laptop: '0',
      screen_lifetime: 7,
      nb_users_actual: 0,
      nb_screens_per_user: 1
    }
  }
}
</script>

<style lang="css">
.score0 {
  background-color: #e08585
}
.table.is-hoverable tbody tr.score0:hover {
  background-color: #efc2c2
}
.score1 {
  background-color: #ecbf93
}
.table.is-hoverable tbody tr.score1:hover {
  background-color: #f4d9be
}
.score2 {
  background-color: #c1dd88
}
.table.is-hoverable tbody tr.score2:hover {
  background-color: #d6e9af
}
input.inline-number {
  border: 1px solid #ccc
}
input.inline-number.w3 {
  width: 2.7rem
}
input.inline-number.w4 {
  width: 3.2rem
}
input.inline-number.w5 {
  width: 3.7rem
}
td.vcenter {
  vertical-align: middle
}
table.table.condensed td {
  padding-top: 0.2em;
  padding-bottom: 0.2em;
}
.button.is-tiny {
  font-size: 0.5rem
}
button.trash {
  border-style: none;
  margin-left: 10px;
}
</style>
