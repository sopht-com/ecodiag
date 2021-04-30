
<template>
  <div>
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
                <input v-model.number="nbUsers_actual" type="number" min="0" max="99999" step="1" size="is-small" class="inline-number w5" />
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
          <b-button label="OK" type="is-primary" @click="$emit('close'); show_nb_screen_modal=false; update_estimated_screens()" />
        </footer>
      </div>
    </b-modal>

    <div class="columns is-multiline">

      <div class="column is-5">
        <article v-if="filemap.length > 0" class="notification">
          <p>Fichier : {{filemap[0].filename}}</p>
          <table class="table is-fullwidth condensed is-small">
            <tr v-if="method === 'flux'"><th></th>
              <th class="has-text-right">
                <span class="icon is-small"><i class="sui sui-check"></i></span>
              </th>
              <th class="has-text-right" v-show="!params.includes_empty_year">
                <span>sans date</span>
              </th>
              <th class="has-text-right">
                <span>hors période</span>
              </th>
            </tr>
            <tr v-for="row in csvsummary_items" :key="row.label">
              <td v-html="row.label"></td>
              <td class="has-text-right">
                {{count_items_of_file(0, e => year_ok(e.year) && row.condition(e))}}
              </td>
              <td class="has-text-right" v-show="method === 'flux' && !params.includes_empty_year">
                {{count_items_of_file(0, e => e.year === '' &&  row.condition(e))}}
              </td>
              <td class="has-text-right" v-show="method === 'flux'">
                {{count_items_of_file(0, e => (!year_ok(e.year)) && e.year !== '' &&  row.condition(e))}}
              </td>
            </tr>
            <tr v-if="method === 'flux' && nb_screens_in_csv === 0">
              <td>Ecrans suppl. <strong>estimés</strong> :</td>
              <td class="has-text-right">{{current_estimated_screens}}</td>
              <td>
                <b-button size="is-tiny" @click="show_nb_screen_modal=true">
                  <b-icon icon="pencil"/>
                </b-button>
              </td>
              <td v-show="!params.includes_empty_year"></td>
            </tr>
        </table>
        </article>
      </div>

      <div class="column is-4">
        <article v-if="devicelist.length > 0" class="notification">
          <p>Outils et options</p>
          <b-field v-if="nb_outofperiod_rows > 0">
            <b-checkbox v-model="show_outofperiod">
              Afficher les {{nb_outofperiod_rows}} lignes hors période
            </b-checkbox>
          </b-field>
          <b-field v-if="method === 'flux' && nb_emptyyear_rows > 0 && !hide_empty_year">
            <b-checkbox v-model="params.includes_empty_year">
              Inclure les {{nb_emptyyear_rows}} lignes sans année dans le bilan
            </b-checkbox>
          </b-field>
          <b-field v-if="method === 'flux' && nb_emptyyear_rows > 0">
            <b-checkbox v-if="!params.includes_empty_year" v-model="hide_empty_year">
              Masquer les {{nb_emptyyear_rows}} lignes sans année
            </b-checkbox>
          </b-field>
          <b-field>
            <button @click="simplify_data" class="button is-primary">
              <span>Simplifier la table</span>
            </button>
          </b-field>
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

    <div id="ecodiagtable" v_if="devicelist.header_map">
    <input v-if="is_listening_add_item"
    type="button" value="+" name="devices_add_row" style="position: absolute;bottom: 2px;"
          @click="add_new_item('desktop')" >
    <b-table
      v_if="devicelist.length>0"
      :data="displayed_devicelist"
      hoverable
      detailed
      custom-detail-row
      detail-key="id"
      show-detail-icon
      custom-row-key="id"
      :opened-detailed="devicelist.filter(e => e.score===0).map(e => e.id)"
      :sort-icon="'sui-angle-up'"
      default-sortXXX="status"
      :row-class="(row, index) => Boolean(row.item.csvdata) && filemap.length>0 ? '' : 'ed-hide-detail'"
      :paginated="displayed_devicelist.length>200"
      narrowed
      per-page="200"
    >

      <b-table-column field="status" sortable label="status" v-slot="props">
        <span v-if="props.row.id !== 'add'">
          <b-tag rounded v-if="props.row.status === status.user_ok" type="is-success">Valide</b-tag>
          <b-tag rounded v-else-if="props.row.status === status.csv_ok" type="is-success">Valide (csv)</b-tag>
          <b-tag rounded v-else-if="props.row.status === status.invalid_year" type="is-warning">Année invalide</b-tag>
          <b-tag rounded v-else type="is-danger">Inconnue</b-tag>
        </span>
      </b-table-column>

      <b-table-column field="type" sortable :label="$t('words.type')" v-slot="props">
        <ecodiag-select-type expanded
          v-model="props.row.item.type"
          :msg="props.row.id === 'add' ? 'ajouter un élément' : '...'"
          @input="item_type_changed(props.row.id, props.row.item)">
        </ecodiag-select-type>
      </b-table-column>

      <b-table-column field="model" sortable :label="$t('words.model')" v-slot="props" :td-attrs="()=>({style:{'width': '12rem'}})">
        <ecodiag-select-model expanded v-model="props.row.item.model" :item_type="props.row.item.type" @input="item_model_changed(props.row.item)">
        </ecodiag-select-model>
      </b-table-column>

      <b-table-column field="year" :visible="method=='flux'" sortable :label="$t('words.purchase_year')" numeric v-slot="props">
        <input class="input is-small inline-number" v-if="props.row.id !== 'add'" v-model.number="props.row.item.year"
          type="number" min="1900" max="2100" step="1" style="width:3.7rem" />
      </b-table-column>

      <b-table-column field="nb" sortable :label="$t('words.quantity')" numeric v-slot="props">
        <span class="unit" v-if="props.row.id !== 'add'">
          <input class="input is-small inline-number" v-model.number="props.row.item.nb" type="number" min="0" max="99999" step="1" style="width:3.5em" />
        </span>
        <button class="trash has-text-grey" v-if="props.row.id !== 'add'" @click="delete_row(props.row.item)" >
          <b-icon icon="trash" />
        </button>
      </b-table-column>

      <b-table-column field="item.lifetime" :visible="method=='stock'" :label="$t('words.lifetime')" width="4rem" numeric v-slot="props">
        <span class="unit" v-if="is_valid_type(props.row.item.type)">
          <input class="input is-small inline-number" v-model.number="props.row.item.lifetime" type="number" min="1" max="99999" step="0.5" style="width:3.5em"
             @change="function () { if (!props.row.item.lifetime_unlocked) item['lifetime2'] = item.lifetime * 1.5 }" />
        </span>
      </b-table-column>

      <b-table-column field="grey" :visible="optionalColumns.includes('grey')" sortable numeric width="8rem">
        <template v-slot:header="{}">
          <!-- {{$t('words.fabrication')}}<br/> -->
          <div class="is-size-7">kgCO2e/
          <select v-model="normalization" class="is-size-7">
            <option v-for="key in normalization_list" :key="key" :value="key">
              {{$t('words.'+key)}}
            </option>
          </select>
          </div>
          <b-tooltip label="fabrication + transport + fin de vie" append-to-body>
          hors usage
          </b-tooltip>
        </template>
        <template v-slot="props">
          <span v-if="props.row.grey > 0">{{props.row.grey}}</span>
        </template>
      </b-table-column>

      <template slot="detail" slot-scope="props">
        <tr v-if="props.row.item.csvdata && filemap.length>0" class="ed-detail">
          <td></td>
          <td></td>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ props.row.item.csvdata ? props.row.item.csvdata[filemap[props.row.item.origin].in_type] : '' }}</span></td>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ props.row.item.csvdata ? props.row.item.csvdata[filemap[props.row.item.origin].in_model] : '' }}</span></td>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;<span class="has-text-right">{{ props.row.item.csvdata ? props.row.item.csvdata[filemap[props.row.item.origin].in_date] : '' }}</span></td>
          <td></td>
          <td></td>
        </tr>
      </template>

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

/* eslint-disable camelcase, vue/no-mutating-props */

import { devices } from '../devices'
import { device_utils } from '../device_utils'
import messages from '../i18n'

export default {
  name: 'ecodiag-hybrid-device-table',

  emits: [ 'addItem', 'changeReferenceYear' ],

  components: {
    'ecodiag-select-type': () => import('./type_selector.vue'),
    'ecodiag-select-model': () => import('./model_selector.vue')
  },

  props: {
    'devicelist': Array,
    'method': { type: String, default: 'flux' },
    'nbUsers': Number,
    'referenceYear': { type: Number, default: 2020 },
    'optionalColumns': { type: Array, default: () => [] },
    'l1p5': { type: Boolean, default: false }
  },

  i18n: {
    sharedMessages: messages
  },

  mixins: [device_utils],

  computed: {
    displayed_devicelist: function () {
      let self = this
      let tmp_list = this.devicelist.filter(e => this.display_predicate(e))
        /* this is to make 'status' dynamic while enabling sorting based on status */
        .map(function (e) {
          let res = {
            id: e.id,
            type: e.type,
            model: e.model,
            year: e.year,
            item: e,
            nb: e.nb,
            score: e.score,
            status: self.compute_status(e, self.method, self.referenceYear),
            grey: self.compute_grey(e) }
          return res
        })
      if ((!this.is_listening_add_item) /* && (tmp_list.filter(e => e.id === 'add').length === 0) */) {
        let tmpitem = this.create_device_item()
        tmpitem.year = this.referenceYear
        let additem = {
          id: 'add',
          type: '...',
          model: undefined,
          year: this.referenceYear,
          item: tmpitem,
          nb: 1,
          score: -3,
          status: this.status.unknown,
          grey: 0
        }
        tmp_list.push(additem)
      }
      return tmp_list
    },
    is_listening_add_item () {
      return Boolean(this.$listners) && Boolean(this.$listners.addItem)
    },
    nb_outofperiod_rows () {
      return this.devicelist.filter(e => e.score >= 0 && e.year !== '' && !this.is_valid_year(e.year, this.method, this.referenceYear)).length
    },
    nb_emptyyear_rows () {
      return this.devicelist.filter(e => e.score >= 0 && e.year === '').length
    },
    current_estimated_screens () {
      let item = this.get_estimated_screen_item()
      if (item) {
        return item.nb
      } else {
        return 0
      }
    }
  },

  updated () {
    if (this.l1p5) {
      window.$('.chevron-right').addClass('sui-chevron-right')
      window.$('i.trash').addClass('sui-trash')
      window.$('i.pencil').addClass('sui-pencil')
    }
  },

  methods: {

    is_valid_type: function (type) {
      return type in this.devices
    },

    compute_grey: function (item) {
      let factor = this.get_device_factor(item.type, item.model).mean
      return (this.normalization === 'year'
        ? Math.round(item.nb * factor / (this.method === 'stock' ? item.lifetime : this.params.damping_factor), 0)
        : Math.round(factor, 0))
    },

    count_items: function (filter) {
      return this.devicelist.filter(e => e.score >= 0 && filter(e)).reduce((r, e) => r + e.nb, 0)
    },

    count_items_of_file: function (file_id, filter) {
      return this.count_items(e => Boolean(e.csvdata) && e.origin === file_id && filter(e))
    },

    nb_estimated_screens: function (method) {
      if (!method) {
        method = this.nb_screen_method
      }
      let round = x => Math.round(x * 10) / 10
      if (method === 'from_nb_PCs') {
        return round(this.count_items_of_file(0, e => this.year_ok(e.year) && e.type === 'desktop') * this.nb_screens_per_desktop +
                     this.count_items_of_file(0, e => this.year_ok(e.year) && e.type === 'laptop') * this.nb_screens_per_laptop)
      } else if (method === 'from_nb_users') {
        return round(this.nbUsers_actual * this.nb_screens_per_user / this.screen_lifetime * this.params.damping_factor)
      } else {
        return this.count_items(e => e.type === 'screen')
      }
    },

    get_estimated_screen_item () {
      let estimated_entries = this.devicelist.filter(e => Boolean(e.origin) && (e.origin === -1))
      if (estimated_entries.length > 0) {
        return estimated_entries[0]
      } else {
        return undefined
      }
    },

    update_estimated_screens () {
      let nb_additional_screens = this.nb_estimated_screens()
      // check whether there is already an entry
      let item = this.get_estimated_screen_item()
      if (item) {
        this.$buefy.dialog.confirm({
          message: 'Remplacer l\'estimation précédente de ' + item.nb + ' écrans par la nouvelle estimation de ' + nb_additional_screens + ' ?',
          onConfirm: function () { item.nb = nb_additional_screens }
        })
      } else {
        item = this.add_new_item('screen')
        item.origin = -1
        item.nb = nb_additional_screens
      }
    },

    add_new_item: function (type) {
      let item = this.create_device_item(type)
      item.year = this.referenceYear
      this.devicelist.push(item)
      return item
    },

    delete_row: function (item) {
      item.score = -1
    },

    validate_row: function (item) {
      item.score = 3
    },

    delete_empty_year: function () {
      this.devicelist.filter(e => e.year === '').forEach(this.delete_row)
    },

    validate_empty_year: function () {
      this.devicelist.filter(e => e.year === '').forEach(this.validate_row)
    },

    item_type_changed: function (id, item) {
      if (id === 'add') {
        this.devicelist.push(item)
      }
      this.validate_row(item)
    },
    item_model_changed: function (item) {
      this.validate_row(item)
    },
    load_csv: function (file) {
      var reader = new FileReader()
      let self = this
      let filename = file.name
      let handle_screens = function () {
        if (self.nbUsers > 0 && self.nbUsers_actual === 0) {
          self.nbUsers_actual = self.nbUsers
        }
        self.nb_screens_in_csv = self.count_items_of_file(self.filemap.length - 1, e => e.type === 'screen')
        if (self.nb_screens_in_csv === 0) {
          if (self.method === 'flux') {
            self.nb_screen_method = 'from_nb_PCs'
            self.show_nb_screen_modal = true
          } else {
            self.$buefy.dialog.alert({
              message: 'Aucun écran trouvé dans le listing, pensez à les rajouter !' })
          }
        }
      }
      reader.onload = (function (/* f */) {
        return function (e) {
          let [csvdata, headermap] = this.parse_raw_csv(e.target.result)

          headermap['filename'] = filename
          // remove previously imported data
          self.filemap.splice(0, self.filemap.length)
          for (let i = 0; i < self.devicelist.length; ++i) {
            let item = self.devicelist[i]
            if ('origin' in item && (item.origin === 0 || item.origin === -1)) {
              self.devicelist.splice(i, 1)
              i--
            }
          }
          self.filemap.push(headermap)
          const fileid = self.filemap.length - 1
          csvdata.forEach(function (e) {
            e['origin'] = fileid
            self.devicelist.push(e)
          })

          if (self.devicelist.filter(e => self.year_ok(e.year)).length === 0) {
            // there is nothing for the current year,
            // try to guess
            let max_year = self.devicelist.map(e => e.year).filter(y => +y > 0).reduce((prev, curr) => Math.max(prev, curr), 0)
            if (max_year > 0) {
              self.$buefy.dialog.confirm({
                message: 'Aucune entrée trouvée pour l\'année courante (' + self.referenceYear +
                  '). Changer l\'année du bilan pour ' + max_year + ' ?',
                onConfirm: function () {
                  self.$emit('changeReferenceYear', max_year)
                  handle_screens()
                },
                onCancel: function () {
                  handle_screens()
                }
              })
            }
          } else {
            handle_screens()
          }
        }.bind(this)
      }.bind(this))(file)

      reader.readAsText(file)
    },

    year_ok (y) {
      return this.is_valid_year(y, this.method, this.referenceYear)
    },

    display_predicate (item) {
      return (item.score >= 0) && /* negative means soft deleted */
            (
              (!item.csvdata) || /* we show all user entered rows */
              (this.method === 'stock') || /* in this case the purchase year is irrelevant */
              (this.year_ok(item.year)) ||
              (item.year === '' && !this.hide_empty_year) ||
              (item.year !== '' && this.show_outofperiod))
    },

    /* This function merge all valid entries with respect to type/model (ignoring actual purchase year),
       while removing all invalid entries (unknown, out of period, etc.).
       The purchase year of valid entries is rewriteen as the current reference year */
    simplify_data () {
      var copy = []
      for (let i in this.devicelist) {
        let item = this.clone_obj(this.devicelist[i])
        let status = this.compute_status(item, this.method, this.referenceYear)
        if (item && (status === this.status.user_ok || status === this.status.csv_ok) && item.nb > 0) {
          item.key = item._type.concat(item._model)
          copy.push(item)
        }
      }
      copy = this.csv_merge_wrt_keys(copy)
      this.devicelist.splice(0, this.devicelist.length)
      for (let i in copy) {
        let item = copy[i]
        this.devicelist.push(this.create_device_item(item._type, { model: item._model, nb: item.nb, year: this.referenceYear }))
      }
      this.filemap.splice(0, this.filemap.length)
    }
  },

  watch: {
    dropFile: function () {
      this.load_csv(this.dropFile)
    }
  },

  data () {
    return {
      dropFile: {},
      devices: devices,
      filemap: [],
      hide_empty_year: false,
      show_outofperiod: false,
      nb_screens_in_csv: 0,
      show_nb_screen_modal: false,
      nb_screen_method: 'none',
      nb_screens_per_desktop: 1,
      nb_screens_per_laptop: 0.5,
      screen_lifetime: 7,
      nbUsers_actual: 0,
      nb_screens_per_user: 1,
      normalization_list: ['year', 'unit'],
      normalization: 'year',
      csvsummary_items: [
        { label: 'Serveurs :', condition: e => e.type === 'server' },
        { label: 'PC fixes :', condition: e => e.type === 'desktop' },
        { label: 'Laptops :', condition: e => e.type === 'laptop' },
        { label: 'Ecrans :', condition: e => e.type === 'screen' },
        { label: 'Autres :', condition: e => !['server', 'deskptop', 'laptop', 'screen'].includes(e.type) },
        { label: '<strong>Total reconnus :</strong>', condition: e => e.score > 0 },
        { label: '<em>Non reconnus :</em>', condition: e => e.score === 0 }
      ]
    }
  },
  mounted () {
  }
}
</script>

<style lang="css">
#ecodiagtable table.table {
  border-collapse: collapse
}
tr.ed-detail td {
  padding: 0;
  font-size: 80%;
  font-style: italic;
  border-top: 2px solid transparent ;
}
tr.ed-detail td span {
  position: relative;
  top: -4px;
}
tr.ed-hide-detail td a {
  display: none
}
input.input.inline-number {
  padding-left: 6px;
  padding-right: 4px
}
td.vcenter {
  vertical-align: middle
}
table.table.condensed td {
  padding-top: 0.2em;
  padding-bottom: 0.2em;
}
.button.is-tiny {
  font-size: 0.75rem;
  padding: 0 0.75rem;
  height: 2em;
}
button.trash {
  border-style: none;
  margin-left: 0;
  padding:0;
  background: none;
  cursor: pointer;
}

</style>
