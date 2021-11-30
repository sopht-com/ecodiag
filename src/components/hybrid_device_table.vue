
<template>
  <div>
    <b-modal
      :active.sync="show_nb_screen_modal"
      has-modal-card
      :can-cancel="['escape', 'x']"
    >
      <div class="dialog"  style="width: 800px; height: auto">
      <div class="modal-card"  style="max-width: 100%">
        <header class="modal-card-head">
          <p class="modal-card-title">La liste fournie ne contient aucun écran d'ordinateur !</p>
        </header>
        <section class="modal-card-body">
          <div class="block">Pour estimer le nombre d’écrans achetés dans votre unité sur la période, choisissez une des {{GES1p5 ? 2 : 3}} options suivantes :</div>
          <table class="table is-striped is-hoverable is-fullwidth">
            <tr :class="(!GES1p5) && nb_screen_method === 'from_nb_PCs' ? 'has-background-primary-light' : ''">
                <td class="vcenter">
                  <b-field>
                    <b-radio v-model="nb_screen_method"
                        native-value="from_nb_PCs">
                    </b-radio>
                  </b-field>
                </td>
                <td>
                  Comptabiliser en moyenne :<br/>
              <input v-model.number="nb_screens_per_desktop" type="number" min="0" max="10" step="0.1" :size="size" class="inline-number w3" /> écran acheté par PC-fixe acheté, et<br/>
              <input v-model.number="nb_screens_per_laptop" type="number" min="0" max="10" step="0.1" :size="size" class="inline-number w3" /> écran acheté par portable acheté, <br/>
              soit une estimation de <strong>{{nb_estimated_screens(current_file,'from_nb_PCs')}}</strong> écrans achetés sur la période.
                </td>
              </tr>
            <tr :class="(!GES1p5) && nb_screen_method === 'from_nb_users' ? 'has-background-primary-light' : ''" v-show="!GES1p5">
              <td class="vcenter">
                <b-field>
                  <b-radio v-model="nb_screen_method"
                        native-value="from_nb_users">
                  </b-radio>
                </b-field>
              </td>
              <td>
                Comptabiliser
                <input v-model.number="nbUsers_actual" type="number" min="0" max="99999" step="1" :size="size" class="inline-number w5" />
                agents dans l'unité, avec en moyenne
                <input v-model.number="nb_screens_per_user" type="number" min="0" max="10" step="0.1" :size="size" class="inline-number w3" />
                écrans par agent,<br/> et une durée de vie moyenne des écrans
                <input v-model.number="screen_lifetime" type="number" min="1" max="99" step="0.5" :size="size" class="inline-number w4" /> années,<br/>
                soit une estimation de <strong>{{nb_estimated_screens(current_file,'from_nb_users')}}</strong> écrans achetés sur la période.
              </td>
            </tr>
            <tr :class="(!GES1p5) && nb_screen_method === 'none' ? 'has-background-primary-light' : ''">
              <td class="vcenter">
                <b-field>
                  <b-radio v-model="nb_screen_method" native-value="none">
                  </b-radio>
                </b-field>
              </td>
              <td>
                Aucun écran acheté sur la période, ou bien ajoutez vous-même les écrans (nombre, type, année) via le bouton "ajouter" tout en bas du tableau de la fenêtre de saisie.
              </td>
            </tr>
          </table>
        </section>

        <footer class="modal-card-foot">
          <b-button label="OK" type="is-primary" :disabled="!Boolean(nb_screen_method)" @click="$emit('close'); show_nb_screen_modal=false; update_estimated_screens(current_file)" />
        </footer>
      </div>
      </div>
    </b-modal>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-7">
        <div v-if="filemap.length > 0" class="tile is-child">
          <article class="notification">
            <div class="columns">
              <div class="column">
                <b-select expanded v-model="current_file" :disabled="filemap.length===0 || readOnly">
                  <option v-for="(file,key) in filemap" :key="key" :value="key">
                      <template v-if="key !== 0">Synthèse du fichier </template>
                      {{file.filename}}
                    </option>
                </b-select>
              </div>
              <div v-if="!readOnly" class="column is-narrow">
                <b-button @click="delete_file(current_file)">
                  <b-icon icon="trash" />
                </b-button>
              </div>
            </div>
            <template v-if="!params.ignore_year">
              <table :class="'table is-fullwidth condensed '+size">
                <tr v-if="method === 'flux'"><th></th>
                  <th class="has-text-right">
                    <b-icon icon="check" :size="size" />
                  </th>
                  <th class="has-text-right" v-show="!params.includes_empty_year">
                    <span>sans date</span>
                  </th>
                  <th class="has-text-right">
                    <span>hors période</span>
                  </th>
                </tr>
                <tr v-for="row in csvsummary_items" :key="row.label">
                  <template v-if="row.show()">
                    <td v-html="row.label"></td>
                    <td class="has-text-right">
                      {{count_items_of_file(current_file, e => year_ok(e.year) && row.condition(e))}}
                    </td>
                    <td class="has-text-right" v-show="method === 'flux' && !params.includes_empty_year">
                      {{count_items_of_file(current_file, e => is_empty_year(e.year) &&  row.condition(e))}}
                    </td>
                    <td class="has-text-right" v-show="method === 'flux'">
                      {{count_items_of_file(current_file, e => (!year_ok(e.year)) && (!is_empty_year(e.year)) &&  row.condition(e))}}
                    </td>
                  </template>
                </tr>
                <tr v-if="method === 'flux' && current_file > 0 && get_estimated_screen_item(current_file)">
                  <td>Écrans suppl. <strong>estimés</strong> :</td>
                  <td class="has-text-right">{{current_estimated_screens}}</td>
                  <td>
                    <b-button size="is-tiny" @click="show_nb_screen_modal=true">
                      <b-icon icon="pencil"/>
                    </b-button>
                  </td>
                  <td v-show="!params.includes_empty_year"></td>
                </tr>
              </table>
            </template>
            <template v-else>
              <div class="columns">
                <div v-for="colId in [0, 1]" :key="colId" :class="'column ' + (colId ? 'is-7' : 'is-5')">
                  <table :class="'table is-fullwidth condensed '+size">
                    <tr v-for="row in csvsummary_items" :key="row.label">
                      <template v-if="row.show() && row.col === colId">
                        <td v-html="row.label"></td>
                        <td class="has-text-right">
                          {{count_items_of_file(current_file, e => row.condition(e))}}
                        </td>
                      </template>
                    </tr>
                    <tr v-if="method === 'flux' && current_file > 0 && get_estimated_screen_item(current_file) && colId === 1">
                      <td>Écrans suppl. <strong>estimés</strong> :</td>
                      <td class="has-text-right">
                        <b-button size="is-tiny" @click="show_nb_screen_modal=true">
                          <b-icon icon="pencil"/>
                        </b-button>
                        {{current_estimated_screens}}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </template>
          </article>
        </div>
      </div>
      <div class="tile is-vertical is-parent">
        <div v-if="!readOnly" class="tile is-child">
          <b-upload
            v-model="dropFile"
            drag-drop
            expanded
            type="is-info"
          >
            <section :class="'section'+(hideTools?'':' condensed')">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large" />
                </p>
                <p>
                  Téléverser un fichier (.{{GES1p5?'t':'c'}}sv) <br/>
                </p>
              </div>
            </section>
          </b-upload>
        </div>

        <div class="tile is-child" v-if="!hideTools">
          <article v-if="devicelist.length > 0" class="notification">
            <p>Outils et options</p>
            <b-field v-if="nb_outofperiod_rows > 0">
              <b-checkbox v-model="show_outofperiod">
                Afficher les {{nb_outofperiod_rows}} lignes hors période
              </b-checkbox>
            </b-field>
            <template v-if="method === 'flux' && nb_emptyyear_rows > 0">
              Il y a {{nb_emptyyear_rows}} lignes sans année :
              <div class="buttons">
                <b-button v-show="!params.includes_empty_year"
                  @click="toggle_hide_empty_year"
                  type="is-info is-light"
                  :icon-left="hide_empty_year ? 'eye-slash' : 'eye'">
                  <span v-if="hide_empty_year">Afficher</span>
                  <span v-else>Masquer</span>
                </b-button>
                <b-button v-show="!hide_empty_year" @click="handle_date_emptyyears" type="is-success">
                  <span>Les dater</span>
                </b-button>
              </div>
            </template>
            <b-field>
              <button @click="simplify_data" class="button is-primary">
                <span>Simplifier la table</span>
              </button>
            </b-field>
          </article>
        </div>
      </div>
    </div>

    <!-- <p v-if="GES1p5">
      Liste complête et détaillée des équipements :
    </p> -->

    <div id="ecodiagtable" v_if="devicelist.header_map">

    <b-table
      v_if="devicelist.length>0"
      :data="displayed_devicelist"
      ref="ecodiagTable"
      hoverable
      detailed
      custom-detail-row
      detail-key="id"
      show-detail-icon
      custom-row-key="id"
      :opened-detailed="displayed_devicelist.filter(open_condition).map(e => e.id)"
      @details-open="row => row.item['opened'] = true"
      @details-close="row => row.item['opened'] = false"
      sort-icon="angle-up"
      :default-sort="default_sort"
      @sort="sort_items"
      :backend-sorting="true"
      :row-class="(row, index) => row.item.details.length > 0 ? '' : 'ed-hide-detail'"
      :paginated="displayed_devicelist.length>perPage"
      :narrowed='narrowed'
      :per-page="perPage"
    >

      <!-- This hidden column is a hack to enable column sorting while editing items.
           By default, if sorting is enabled for a given column, and that an edit
           change the row order, then user lost track of the item he/she is currently editing,
           which is really painful!
           The workaround consists in handling sorting by hand through ':backend-sorting' and '@sort'
           to record the current order within the 'bakedorder' attributes and fallback to bakedorder
           order anytime an input field is clicked. -->
      <b-table-column field="bakedorder" sortable :visible="false" />

      <b-table-column field="status" sortable label="Validité" v-slot="props">
        <span v-if="props.row.id !== 'add'">
          <b-tag rounded v-if="props.row.status === status.user_ok" type="is-success">Valide</b-tag>
          <b-tag rounded v-else-if="props.row.status === status.csv_ok" type="is-success">Valide{{GES1p5?'':'(csv)'}}</b-tag>
          <b-tag rounded v-else-if="props.row.status === status.invalid_year" type="is-warning">Hors période</b-tag>
          <b-tag rounded v-else-if="props.row.status === status.unknown_year" type="is-warning">Année manquante</b-tag>
          <b-tag rounded v-else type="is-danger">{{GES1p5 ? 'Invalide' : 'Inconnue'}}</b-tag>
        </span>
      </b-table-column>

      <b-table-column field="type" sortable :label="capitalize($t('words.type'))" v-slot="props">
        <div @click="stop_sorting">
          <ecodiag-select-type
            narrowed
            expanded
            :size="size"
            v-model="props.row.item.type"
            :msg="props.row.id === 'add' ? 'ajouter un élément' : '...'"
            :disabled="readOnly"
            @input="item_type_changed(props.row)">
          </ecodiag-select-type>
        </div>
      </b-table-column>

      <b-table-column field="model" sortable :label="capitalize($t('words.model'))" v-slot="props" :td-attrs="()=>({style:{'width': '12rem'}})">
        <div @click="stop_sorting">
          <ecodiag-select-model
            narrowed
            expanded
            :size="size"
            :always-visible="GES1p5"
            v-model="props.row.item.model"
            :item_type="props.row.item.type"
            :disabled="readOnly"
            @input="validate_disp_row(props.row)">
          </ecodiag-select-model>
        </div>
      </b-table-column>

      <b-table-column field="year" :visible="method=='flux' && !params.ignore_year" sortable :label="capitalize($t('words.purchase_year'))" numeric v-slot="props">
        <div @click="stop_sorting">
          <ecodiag-select-year
              v-model="props.row.item.year"
              v-show="props.row.id !== 'add'"
              :min-year="2000"
              :max-year="max_selectable_year"
              :disabled="readOnly"
              @change="$emit('updated', [props.row.item])">
          </ecodiag-select-year>
        </div>
      </b-table-column>

      <b-table-column field="nb" sortable :label="capitalize($t('words.quantity'))" numeric v-slot="props">
        <span class="unit" v-if="props.row.id !== 'add'" @click="stop_sorting">
          <input :class="'input inline-number '+size" v-model.number="props.row.nb" type="number" min="0" max="99999" step="1" style="width:3.5em"
            @change="$emit('updated', [props.row.item])" :disabled="readOnly" />
        </span>
        <button class="trash has-text-grey" v-if="(!GES1p5) && props.row.id !== 'add' && !readOnly" @click="delete_row(props.row)" >
          <b-icon icon="trash" />
        </button>
      </b-table-column>

      <b-table-column :visible="GES1p5" v-slot="props">
        <b-button v-if="GES1p5 && props.row.id !== 'add' && !readOnly" size="is-small" @click="delete_row(props.row)" >
          <b-icon icon="trash" style="font-size: 16px;" />
        </b-button>
      </b-table-column>

      <b-table-column field="item.lifetime"
        :visible="method=='stock'"
        :label="capitalize($t('words.lifetime')) + (optionalColumns.includes('objective') ? ' (actuel/objectif)' : '')"
        :width="optionalColumns.includes('objective') ? '8.8rem' : '4rem'"
        numeric v-slot="props">
        <span class="unit" v-if="is_valid_type(props.row.item.type)" @click="stop_sorting">
          <input :class="'input inline-number '+size" v-model.number="props.row.item.lifetime" type="number" min="1" max="999" step="0.5" style="width: 2.9rem"
             @change="function () { if (!props.row.item.lifetime_unlocked) props.row.item['lifetime2'] = props.row.item.lifetime * params.lifetime_factor; $emit('updated', [props.row.item]) }"
              />
        </span>
        <template v-if="is_valid_type(props.row.item.type) && optionalColumns.includes('objective')">
          &nbsp;/&nbsp;
          <locker :onchange="function (x) { props.row.item['lifetime_unlocked'] = x }">
            <input :class="'input inline-number '+size" v-model.number="props.row.item.lifetime2" type="number" min="1" max="999" step="0.5" style="width: 2.9rem" disabled
              @change="$emit('updated', [props.row.item])" />
          </locker>
        </template>
      </b-table-column>

      <b-table-column field="grey" :visible="optionalColumns.includes('grey')" sortable numeric width="8rem">
        <template v-slot:header="{}">
          <!-- {{$t('words.fabrication')}}<br/> -->
          <div class="is-size-7">kgCO2e/
          <select v-model="normalization" class="is-size-7" @click.stop>
            <option v-for="key in normalization_list" :key="key" :value="key">
              {{$t('words.'+key)}}
            </option>
          </select>
          </div>
          <!-- fabrication &amp; transport -->
          <b-tooltip multilined
            :label="'total \'fabrication + transport + fin de vie\''
              + (normalization === 'year'
                ? (' pour les N unités' +
                  (method === 'flux'
                  ? (params.damping_factor === 1 ? '' : ', divisé par la période d\'amortissement de ' + params.damping_factor + ' ans')
                  : ', divisé par la durée de vie'))
                : ' pour une unité')"
            type="is-info">
              <b-tag rounded type="is-info is-light">
                <b-icon icon="info" size="is-size-7"></b-icon> calcul
              </b-tag>
          </b-tooltip>
        </template>
        <template v-slot="props">
          <span v-if="props.row.grey > 0">{{props.row.grey}}</span>
        </template>
      </b-table-column>

      <template slot="detail" slot-scope="props">
        <template v-if="props.row.item.details.length>0">
          <tr v-for="el in get_details(props.row.item)" :key="el.key" class="ed-detail">
            <template v-if="el.csvdata">
              <td></td>
              <td>
                <span class="has-text-right" v-if="method==='flux' && !params.ignore_year">{{ el.csvdata[filemap[el.origin].in_date] }}</span>
                <span>l. {{el.csvdata.lines[0] + (el.csvdata.lines.length > 1 ? ',' : '')}}</span>
                <button v-if="el.csvdata.lines.length > 1" @click="show_lines(el.csvdata.lines, el.origin)"><span>...</span></button>
              </td>
              <td>&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ el.csvdata[filemap[el.origin].in_type] }}</span></td>
              <td>&nbsp;&nbsp;&nbsp;&nbsp;<span>
                {{ smart_cat(el.csvdata[filemap[el.origin].in_brand],
                            el.csvdata[filemap[el.origin].in_model]) }}</span></td>
            </template>
            <template v-else>
              <td></td>
              <td></td>
              <td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;Ajouté par l'utilisateur</td>
            </template>
            <td v-if="method=='flux' && !params.ignore_year"></td>
            <td class="has-text-right"><span>{{props.row.item.details.length>1 ? el.nb : ''}}</span>
              <button class="trash has-text-grey" v-if="(!GES1p5) && props.row.item.details.length>1 && !readOnly" @click="delete_subrow(props.row.item, el)" >
                <b-icon icon="trash" />
              </button>
            </td>
            <td v-if="GES1p5">
              <button class="trash has-text-grey" v-if="props.row.item.details.length>1 && !readOnly" @click="delete_subrow(props.row.item, el)" >
                <b-icon icon="trash" style="font-size: 12px;top:-7px" />
              </button>
            </td>
            <td v-if="method=='stock'"></td>
            <td v-if="optionalColumns.includes('grey')"></td>
          </tr>
        </template>
      </template>

      <section slot="empty" class="section">
        <div class="content has-text-grey has-text-centered">
          <p>
            <b-icon icon="ban" size="is-large" />
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
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ecodiag-hybrid-device-table',

  emits: [ 'changeReferenceYear', 'updated' ],

  components: {
    'ecodiag-select-type': () => import('./type_selector.vue'),
    'ecodiag-select-model': () => import('./model_selector.vue'),
    'locker': () => import('./locker.vue'),
    'ecodiag-select-year': () => import('./year_picker.vue')
  },

  props: {
    'devicelist': Array,
    'method': { type: String, default: 'flux' },
    'nbUsers': Number,
    'referenceYear': { type: Number, default: 2020 },
    'optionalColumns': { type: Array, default: () => [] },
    'autoAdd': { type: Boolean, default: true },
    'narrowed': { type: Boolean, default: true },
    'GES1p5': { type: Boolean, default: false },
    'hideTools': { type: Boolean, default: false },
    'autoSimplify': { type: Boolean, default: false },
    'perPage': { type: Number, default: 200 },
    'size': { type: String, default: '' },
    'readOnly': { type: Boolean, default: false }
  },

  i18n: {
    sharedMessages: messages
  },

  mixins: [device_utils],

  computed: {
    max_selectable_year () {
      return Math.max((new Date().getFullYear()) + 1, this.compute_max_year())
    },
    valid_devices_list () {
      return this.extract_valid_items(this.devicelist, this.method, this.referenceYear)
    },

    displayed_devicelist: function () {
      let self = this
      let tmp_list = this.devicelist.filter(e => this.display_predicate(e))
        /* this is to make 'status' dynamic while enabling sorting based on status */
        .map(function (e) {
          let res = {
            item: e,
            score: e.score,
            status: self.compute_status(e, self.method, self.referenceYear),
            grey: self.compute_grey(e) }

          Object.defineProperty(res, 'type', {
            get: function () { return res.item.type }
          })
          Object.defineProperty(res, 'model', {
            get: function () { return res.item.model }
          })
          Object.defineProperty(res, 'year', {
            get: function () { return res.item.year }
          })
          Object.defineProperty(res, 'id', {
            get: function () { return res.item.id }
          })
          Object.defineProperty(res, 'nb', {
            set: function (v) { res.item.nb = v },
            get: function () { return res.item.nb }
          })

          return res
        })

      if (this.sort_field !== 'bakedorder') {
        // console.log('sort_items ' + this.sort_field + ' ' + this.sort_order)
        let s = {}
        if (this.sort_order === 'desc') {
          s = (a, b) => a[this.sort_field] < b[this.sort_field] ? -1 : 1
        } else {
          s = (a, b) => a[this.sort_field] > b[this.sort_field] ? -1 : 1
        }
        tmp_list.sort(s)
      } else {
        tmp_list.sort((a, b) => a.item.bakedorder - b.item.bakedorder)
      }

      if (self.autoAdd /* && (tmp_list.filter(e => e.id === 'add').length === 0) */) {
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

      tmp_list.forEach(function (item, i) {
        item.item['bakedorder'] = i
      })

      return tmp_list
    },
    nb_outofperiod_rows () {
      return this.devicelist.filter(e => e.score >= 0 && (!this.is_empty_year(e.year)) && (!this.is_valid_year(e.year, this.method, this.referenceYear))).length
    },
    nb_emptyyear_rows () {
      return this.devicelist.filter(e => e.score >= 0 && this.is_empty_year(e.year)).length
    },
    current_estimated_screens () {
      let item = this.get_estimated_screen_item(this.current_file)
      if (item) {
        return item.nb
      } else {
        return 0
      }
    }
  },

  methods: {

    get_details (item) {
      if (item.details.length > 0) {
        for (let d of item.details) {
          if (!('key' in d)) {
            d['key'] = uuidv4()
          }
        }
      }
      return item.details
    },

    open_condition (e) {
      let self = this
      return e.score === 0 ||
        (e.item.opened) ||
        ((e.status === this.status.unknown_year) && e.item.details.filter(d => d.origin > 0 && d.csvdata && !self.is_empty_year(d.csvdata[self.filemap[d.origin].in_date])).length > 0)
    },

    toggle_hide_empty_year: function () {
      this.hide_empty_year = !this.hide_empty_year
    },

    smart_cat: function (a, b) {
      if (!a) {
        return b
      } else if (!b) {
        return a
      } else {
        return a + ' - ' + b
      }
    },

    handle_date_emptyyears: function () {
      this.$buefy.dialog.prompt({
        message: 'Fixer l\'année d\'achat des ' + this.nb_emptyyear_rows + ' lignes sans date à l\'année :',
        inputAttrs: {
          type: 'number',
          placeholder: '...',
          value: this.referenceYear,
          maxlength: 2,
          min: 2000,
          max: this.max_selectable_year
        },
        trapFocus: true,
        onConfirm: (value) => this.devicelist.filter(e => e.score >= 0 && this.is_empty_year(e.year)).forEach(
          function (item) {
            item.year = value
          })
      })
    },

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
      if (file_id === 0) {
        return this.count_items(filter)
      } else {
        return this.devicelist.filter(e => e.score >= 0 && filter(e) && e.details.length > 0)
          .reduce((r, e) => e.details.filter(d => d.origin === file_id).reduce((a, d) => a + d.nb, r), 0)
      }
    },

    nb_estimated_screens: function (origin, method) {
      if (!method) {
        method = this.nb_screen_method
      }
      let round = x => Math.round(x * 10) / 10
      if (method === 'from_nb_PCs') {
        return round(this.count_items_of_file(origin, e => this.year_ok(e.year) && e.type === 'desktop') * this.nb_screens_per_desktop +
                     this.count_items_of_file(origin, e => this.year_ok(e.year) && e.type === 'laptop') * this.nb_screens_per_laptop)
      } else if (method === 'from_nb_users') {
        return round(this.nbUsers_actual * this.nb_screens_per_user / this.screen_lifetime * this.params.damping_factor)
      } else {
        return this.count_items(e => e.type === 'screen')
      }
    },

    get_estimated_screen_item (origin) {
      let estimated_entries = this.devicelist.filter(e => Boolean(e.origin) && (e.origin === -origin))
      if (estimated_entries.length > 0) {
        return estimated_entries[0]
      } else {
        return undefined
      }
    },

    update_estimated_screens (origin) {
      let self = this
      let nb_additional_screens = this.nb_estimated_screens(origin)
      // check whether there is already an entry
      let item = this.get_estimated_screen_item(origin)
      if (item) {
        if (item.nb !== nb_additional_screens) {
          this.$buefy.dialog.confirm({
            message: 'Remplacer l\'estimation précédente de ' + item.nb + ' écrans par la nouvelle estimation de ' + nb_additional_screens + ' ?',
            onConfirm: function () {
              item.nb = nb_additional_screens
              self.$emit('updated', [item])
            }
          })
        }
      } else {
        item = this.add_new_item('screen')
        item.origin = -origin
        item.score = 2
        item.nb = nb_additional_screens
        self.$emit('updated', [item])
      }
    },

    add_new_item: function (type) {
      let item = this.create_device_item(type)
      item.year = this.referenceYear
      this.devicelist.push(item)
      this.$emit('updated', [item])
      return item
    },

    delete_row: function (row) {
      if ('item' in row) {
        row = row.item
      }
      row.score = -1
      this.$emit('deleted', [row])
    },

    delete_subrow: function (item, el) {
      let i = item.details.indexOf(el)
      if (i >= 0) {
        item.nb = Math.max(0, item.nb - el.nb)
        item.details.splice(i, 1)
      } else {
        /* eslint-disable no-console */
        console.log('Ecodiag error: in delete_subrow, sub item not found')
      }
      this.$emit('updated', [item])
    },

    validate_row: function (row) {
      row.score = 3
      this.$emit('updated', [row])
    },

    delete_empty_year: function () {
      this.devicelist.filter(e => this.is_empty_year(e.year)).forEach(this.delete_row)
    },

    validate_empty_year: function () {
      this.devicelist.filter(e => this.is_empty_year(e.year)).forEach(this.validate_row)
    },

    sort_items (field, order /* , event */) {
      this.sort_field = field
      this.sort_order = order
    },

    stop_sorting () {
      this.default_sort = 'bakedorder'
      this.$refs.ecodiagTable.initSort()
    },

    compute_max_year () {
      return this.devicelist.map(e => e.year).filter(y => +y > 0).reduce((prev, curr) => Math.max(prev, curr), 0)
    },

    validate_disp_row: function (disp_item) {
      if (this.is_valid_type(disp_item.item.type)) {
        this.validate_row(disp_item.item)
      }
    },
    item_type_changed: function (disp_item) {
      if (disp_item.id === 'add') {
        this.devicelist.push(disp_item.item)
      }
      this.validate_disp_row(disp_item)
    },

    delete_file: function (file_id) {
      if (file_id === 0) {
        // delete everything !
        let self = this
        self.$buefy.dialog.confirm({
          message: 'Êtes-vous sûr de vouloir supprimer toutes les lignes ?',
          onConfirm: function () {
            self.current_file = 0
            self.filemap.splice(1, self.filemap.length - 1)
            self.$emit('deleted', self.devicelist)
            self.devicelist.splice(0, self.devicelist.length)
          } })
      } else {
        let deleted_items = []
        let updated_items = []
        for (let i = 0; i < this.devicelist.length; ++i) {
          let item = this.devicelist[i]
          let to_remove = 0 // count the number of sub-items to remove
          for (let j = 0; j < item.details.length; ++j) {
            let sub = item.details[j]
            if ('origin' in sub) {
              if (sub.origin > file_id) {
                sub.origin--
              } else if (sub.origin < file_id) {
                sub.origin++
              } else if (Math.abs(sub.origin) === file_id) {
                item.details.splice(j, 1)
                to_remove += sub.nb
                j--
              }
            }
          }
          if ('origin' in item && item.origin === -file_id) {
            deleted_items.push(item)
            this.devicelist.splice(i, 1)
            i--
          } else if (to_remove > 0) {
            if (to_remove >= item.nb) {
              deleted_items.push(item)
              this.devicelist.splice(i, 1)
              i--
            } else {
              updated_items.push(item)
              item.nb -= to_remove
            }
          }
        }
        this.filemap.splice(file_id, 1)
        if (file_id >= this.current_file) {
          this.current_file = 0
        }
        this.$emit('deleted', deleted_items)
        this.$emit('updated', updated_items)
      }
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
            self.show_nb_screen_modal = true
          } else {
            self.$buefy.dialog.alert({
              message: 'Aucun écran trouvé dans le listing, pensez à les rajouter !' })
          }
        } else {
          let nb_PCs = self.count_items_of_file(self.filemap.length - 1, e => self.year_ok(e.year) && e.type === 'desktop')
          let nb_laptops = self.count_items_of_file(self.filemap.length - 1, e => self.year_ok(e.year) && e.type === 'laptop')
          if (self.nb_screens_in_csv < 0.5 * (nb_PCs + nb_laptops * 0.5)) {
            self.$buefy.dialog.alert({
              message: '<div class="content"><p>Le nombre d’écrans identifiés (' +
                self.nb_screens_in_csv +
                ') semble faible vis à vis du nombre de PC et portables (' +
                (nb_PCs + nb_laptops) +
                ').</p><p>Pensez à vérifiez vos achats d’écrans et, le cas échéant, à ajouter les écrans manquants (nombre, type, année) via le bouton "ajouter" tout en bas du tableau de la fenêtre de saisie.</p></div>'
            })
          }
        }
      }

      let keep_going = function (headermap, csvdata) {
        self.filemap.push(headermap)
        const fileid = self.filemap.length - 1
        self.current_file = fileid
        let updated_items = []
        csvdata.forEach(function (e) {
          e.details.push({ origin: fileid, csvdata: e.csvdata, nb: e.nb })
          delete e.csvdata
          self.devicelist.push(e)
          updated_items.push(e)
        })

        if (self.autoSimplify) {
          self.devicelist.forEach(function (item, i) {
            item['bakedorder'] = i
          })
          self.simplify_data(true)
        } else {
          self.$emit('updated', updated_items)
        }

        if (self.devicelist.filter(e => self.year_ok(e.year)).length === 0) {
          // there is nothing for the current year,
          // try to guess
          let max_year = self.compute_max_year()
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
      }

      reader.onload = (function (/* f */) {
        return function (e) {
          let [csvdata, headermap, error] = self.parse_raw_csv(e.target.result)

          headermap['filename'] = filename

          // check headers
          let headers_ok = headermap.in_type && headermap.in_model && (headermap.in_year || self.method === 'stock' || self.params.ignore_year)
          let nb_item_type_ok = csvdata.filter(e => e.type !== undefined).reduce((r, e) => r + e.nb, 0)
          if ((!headers_ok) || nb_item_type_ok === 0) {
            // We can still continue if:
            //  - we detected some items
            //  - or we detected the type or model columns and the file is not empty
            // Otherwise there is really nothing to do!
            let can_continue = (nb_item_type_ok > 0) || ((Boolean(headermap.in_type) || Boolean(headermap.in_model)) && csvdata.length > 0)
            let pb_list = (headermap.in_type ? '' : '<li>Colonne "Type" manquante ou non reconnue.</li>') +
                          (headermap.in_model ? '' : '<li>Colonne "Modèle" manquante ou non reconnue.</li>') +
                          (headermap.in_year || self.method === 'stock' || self.params.ignore_year ? '' : '<li>Colonne "Date d\'achat" manquante ou non reconnue.</li>') +
                          (nb_item_type_ok > 0 ? '' : '<li>Aucune entrée n\'a été reconnue, même partiellement.</li>')
            if (can_continue) {
              self.$buefy.dialog.confirm({
                title: 'Attention',
                message: '<div class="content">Bien que ' + nb_item_type_ok + ' éléments aient été reconnus, nous avons détecté le(s) manque(s) suivant(s) :<ul>' +
                         pb_list +
                         '</ul><p>Si vous pensez qu\'il s\'agit d\'une erreur dans votre fichier, vous pouvez abandonner l\'importation et le mettre à jour. Sinon, vous pouvez continuer : l\'outil retiendra les valeurs par défaut.</p></div>',
                cancelText: 'Abandonner l\'importation',
                confirmText: 'Continuer',
                onConfirm: function () {
                  keep_going(headermap, csvdata)
                },
                onCancel: function () {
                }
              })
            } else if (error === 'bad separator') {
              self.$buefy.dialog.alert({
                title: 'Format de fichier invalide',
                message: this.GES1p5
                  ? '<div class="content"><p>Les colonnes doivent être séparées par une tabulation.</p></div>'
                  : '<div class="content"><p>Le séparateur de colonnes doit être l\'un des caractères suivants : <code>,</code>, <code>;</code>, <code>tab</code>.</p></div>'
              })
            } else {
              self.$buefy.dialog.alert({
                title: 'Fichier invalide',
                message: '<div class="content">Nous avons rencontré les problèmes suivants :<ul>' +
                         pb_list +
                         '</ul><p>Cela peut venir d\'un mauvais nommage des colonnes, ou bien d\'un mauvais formattage du fichier.</p></div>'
              })
            }
          } else {
            keep_going(headermap, csvdata)
          }
        }
      })(file)

      reader.readAsText(file)
    },

    year_ok (y) {
      return this.is_valid_year(y, this.method, this.referenceYear)
    },

    display_predicate (item) {
      return (item.score >= 0) && /* negative means soft deleted */
            (
              (item.details.length === 0) || /* we show all user entered rows */
              (this.method === 'stock') || /* in this case the purchase year is irrelevant */
              (this.year_ok(item.year)) ||
              (this.is_empty_year(item.year) && !this.hide_empty_year) ||
              ((!this.is_empty_year(item.year)) && this.show_outofperiod))
    },

    delete_invalids () {
      let deleted_items = []
      for (let i = 0; i < this.devicelist.length; ++i) {
        let item = this.devicelist[i]
        if (!this.is_valid(item, this.method, this.referenceYear)) {
          deleted_items.push(item)
          this.devicelist.splice(i, 1)
          i--
        }
      }
      this.$emit('deleted', deleted_items)
    },

    show_lines (lines, fileid) {
      this.$buefy.dialog.alert({
        message: '<div class="content"><p>Cet élément apparaît dans le fichier ' +
          this.filemap[fileid].filename +
          ' aux lignes suivantes :</p><p>' +
          lines +
          '</p></div>'
      })
    },

    /* This function merge all valid entries with respect to type/model (ignoring actual purchase year),
       while removing all invalid entries (unknown, out of period, etc.).
       The purchase year of valid entries is rewritten as the current reference year */
    simplify_data (conservative = false, remove_filenames = false) {
      let copy = []
      let devicelist = conservative ? this.devicelist : this.valid_devices_list
      for (let in_item of devicelist) {
        let item = this.clone_obj(in_item)
        let status = this.compute_status(item, this.method, this.referenceYear)
        let ok = (status === this.status.user_ok || status === this.status.csv_ok)
        if (ok && (!conservative)) {
          item.details.splice(0, item.details.length)
        }
        if (item && ok && item.nb > 0) {
          item.key = item._type.concat(item._model)
          if (item.origin < 0) {
            item.key = String(item.origin) + item.key
          }
          copy.push(item)
        } else if (conservative) {
          if (!('key' in item)) {
            item['key'] = item._type.concat(item._model)
          }
          if (item.origin < 0) {
            item.key = String(item.origin) + item.key
          }
          copy.push(item)
        }
        if (remove_filenames) {
          this.origin = 0
        }
      }

      // sort items
      copy = copy.sort((a, b) => a.key.localeCompare(b.key))
      // insert while summing up duplicates
      var new_list = []
      for (let el of copy) {
        if (new_list.length > 0 && new_list[new_list.length - 1].key === el.key) {
          let common_el = new_list[new_list.length - 1]
          if (common_el.details.length > 0 && el.details.length === 0) {
            el.details.push({ origin: 0, nb: el.nb })
          } else if (el.details.length > 0 && common_el.details.length === 0) {
            common_el.details.push({ origin: 0, nb: common_el.nb })
          }
          common_el.nb += el.nb
          common_el.details = common_el.details.concat(el.details)
        } else {
          new_list.push(el)
        }
      }
      copy = new_list

      this.$emit('deleted', this.devicelist)
      this.devicelist.splice(0, this.devicelist.length)
      for (let i in copy) {
        let item = copy[i]
        if (conservative) {
          let tmp = this.create_device_item(item._type, { model: item._model, nb: item.nb, year: this.referenceYear, origin: item.origin, score: item.score, details: item.details })
          if ('bakedorder' in item) {
            tmp['bakedorder'] = item.bakedorder
          }
          if ('key' in item) {
            tmp['key'] = item.key
          }
          this.devicelist.push(tmp)
        } else {
          this.devicelist.push(this.create_device_item(item._type, { model: item._model, nb: item.nb, year: this.referenceYear }))
        }
      }
      if (!conservative) {
        this.filemap.splice(1, this.filemap.length)
      }
      if (remove_filenames) {
        this.filemap.splice(1, this.filemap.length - 1)
        this.current_file = 0
      }
      this.$emit('updated', this.devicelist)
    },
    item_added () {
      this.nb_added_items += 1
    }
  },

  watch: {
    dropFile: function () {
      if (this.dropFile) {
        this.load_csv(this.dropFile)
      }
    },
    devicelist: function () {
      if (this.nb_added_items > 0 && this.autoSimplify) {
        this.nb_added_items = 0
        this.devicelist.forEach(function (item, i) {
          item['bakedorder'] = i
        })
        this.simplify_data(true)
      }
    }
  },

  data () {
    return {
      dropFile: {},
      sort_order: 'asc',
      sort_field: 'bakedorder',
      default_sort: 'bakedorder',
      devices: devices,
      filemap: [{ filename: 'Synthèse globale' }],
      hide_empty_year: false,
      show_outofperiod: false,
      nb_screens_in_csv: 0,
      show_nb_screen_modal: false,
      nb_screen_method: undefined,
      nb_screens_per_desktop: 1,
      nb_screens_per_laptop: 0.5,
      screen_lifetime: 7,
      nbUsers_actual: 0,
      nb_screens_per_user: 1,
      normalization_list: ['year', 'unit'],
      normalization: 'year',
      current_file: 0,
      nb_added_items: 0,
      csvsummary_items: [
        { label: 'Serveurs :', condition: e => e.type === 'server', show: () => true, col: 0 },
        { label: 'PC fixes :', condition: e => e.type === 'desktop' || e.type === 'allinone', show: () => true, col: 0 },
        { label: 'Laptops :', condition: e => e.type === 'laptop', show: () => true, col: 0 },
        { label: 'Ecrans :', condition: e => e.type === 'screen', show: () => true, col: 0 },
        { label: 'Autres :', condition: e => !(['server', 'desktop', 'laptop', 'screen', 'allinone'].includes(e.type)), show: () => true, col: 0 },
        { label: '<strong>Total reconnus :</strong>', condition: e => e.score > 0, show: () => (!this.GES1p5) && this.current_file > 0, col: 1 },
        { label: '<em>Non reconnus :</em>', condition: e => e.score === 0, show: () => (!this.GES1p5) && this.current_file > 0, col: 1 },
        { label: '<strong>Total valides :</strong>', condition: e => e.score > 0, show: () => (this.GES1p5) && this.current_file >= 0, col: 1 },
        { label: '<em>Non valides :</em>', condition: e => e.score === 0, show: () => (this.GES1p5) && this.current_file >= 0, col: 1 }
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
  padding-top: 0;
  padding-bottom: 0;
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
  padding-left: 4px;
  padding-right: 2px
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
.vcondensed .select:not(.is-small) select {
  padding-top: 3px;
  padding-bottom: 3px;
  height: 1.9rem;
  margin: 0;
}
.vcondensed .select:not(.is-small) {
  height: 1.9rem;
}
input.input.inline-number:not(.is-small) {
  padding-left: 4px;
  padding-right: 2px;
  padding-top: 3px;
  padding-bottom: 3px;
  height: 1.9rem;
}
article.notification {
  padding-right: 1.5rem
}
.upload .section.condensed {
  padding: 1.2rem 1.5rem
}
.b-table .table th .th-wrap.is-numeric .tag .icon {
  margin-right: 0
}
.b-table .table th .th-wrap.is-numeric .tag  {
  margin-top: 0.3rem
}
</style>
