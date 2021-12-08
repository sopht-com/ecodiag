<template>
<div id="ecodiag-page">

<div class="locale-switcher">
  <input id="locale-switcher-id" type="checkbox" class="locale-switcher-input"
         v-model="$i18n.locale"
         true-value="en"
         false-value="fr" />
  <label for="locale-switcher-id"></label>
  <!-- <select v-model="$i18n.locale"> -->
    <!-- <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">{{ lang }}</option> -->
  <!-- </select> -->
</div>

<div class="logo"></div>
<tabs>

  <tab name="Ecodiag" :selected="true" button-style="margin-left:52px">

    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <div class="tile is-child" style="padding-right: 1rem">
          <chart :plotdata="plotdata"></chart>
        </div>
        <article class="tile is-child notification is-info is-light has-text-centered" style="padding: 1rem;">
          <p class="title is-4 has-text-centered"><b-icon icon="info"></b-icon><ml fr="Règle de calcul">Compute rule</ml></p>
          <p class="subtitle is-6 has-text-centered" style="margin-bottom: 0.5rem"><ml fr="total fabrication &amp; transport">total production &amp; transport</ml></p>
          <table class="is-family-code" style="margin: auto">
              <tr style="border:none">
                <td :rowspan="method === 'flux' && params.damping_factor === 1 ? 1 : 2"  style="vertical-align:middle;border:none;padding:0 4px">
                  <b-tooltip :label="$t('labels.sum_over_rows')" multilined>
                    <span style="font-size: 2rem">&Sigma;</span><span class="is-italic" style="vertical-align:sub">i</span>
                  </b-tooltip>
                </td>
                <td :rowspan="method === 'flux' && params.damping_factor === 1 ? 1 : 2"  style="vertical-align:middle;border:none;padding:0 4px">
                  <b-tooltip :label="$t('words.quantity')">
                    N<span class="is-italic" style="vertical-align:sub">i</span>
                  </b-tooltip>
                </td>
                <td class="is-family-code"
                  :style="method === 'flux' && params.damping_factor === 1
                    ? 'border: none; vertical-align:middle'
                    : 'border-bottom: 2px solid #0D68CE'">
                  <b-tooltip :label="$t('labels.factor_of_el_i')" multilined>
                    {{$t('words.factor')}}<span class="is-italic" style="vertical-align:sub">i</span>
                  </b-tooltip>
                </td>
              </tr>
              <tr style="border:none" v-if="method !== 'flux' || params.damping_factor > 1">
                <td class="is-family-code has-text-centered" style="border:none;padding:0">
                  <template v-if="method === 'stock'">
                    <b-tooltip :label="$t('labels.lifetime_of_el_i')" multilined>
                      {{$t('words.lifetime')}}<span class="is-italic" style="vertical-align:sub">i</span>
                    </b-tooltip>
                  </template>
                  <template v-else>
                    <b-tooltip :label="$t('labels.damping_duration')" multilined>
                      {{params.damping_factor}} {{$t('words.years')}}
                    </b-tooltip>
                  </template>
                </td>
              </tr>
          </table>
        </article>
      </div>
    </div>

    <tabs>

      <tab :name="$t('title.device_list')" :selected="true">

        <device-table
          ref="deviceTable"
          :devicelist="devices_list"
          :method="method"
          :optional-columns="objective ? ['grey', 'objective'] : ['grey']"
          :reference-year="reference_year"
          @changeReferenceYear="(e) => reference_year = e"
          :auto-add="true"
          :auto-simplify="true" />
        <p><br/></p>

        <p class="whatif" v-if="method === 'stock'">
          <ml fr="Bilan consommation électrique : ">Total electricity consumption: </ml>
          <span class="value">{{toFixed(total_elec_kWh(),0)}}</span> kWh/{{$t('words.year')}},
          <ml fr="soit l'équivalent de la production de ">which is equivalent to the production of </ml>
          <span class="value">{{ Math.round(total_elec_kWh() * equiv_data[equiv_selected].factor*10)/10 }}</span>
          <span v-html="trAtt(equiv_data[equiv_selected],'unit')" ></span>

          <select v-model="equiv_selected">
            <option v-for="(value,key) in equiv_data" :value="key" :key="key">
              {{ $t('words.'+key) }}
            </option>
          </select>.
        </p>

        <p class="whatif" v-if="method === 'stock'">
          <ml fr="Total CO2e annuel : ">Total yearly CO2e: </ml>
          <span class="value">{{toFixed(total_elec_kWh()*params.kWh_to_CO2e + total_grey_CO2(),0)}}</span> kgCO2e/{{$t('words.year')}}
            = <span class="value">{{toFixed(total_grey_CO2(),0)}}</span>
            <ml fr=" (fabrication et transport)"> (production and transport)</ml>
            + <span class="value">{{toFixed(total_elec_kWh()*params.kWh_to_CO2e,0)}}</span>
            <ml fr=" (consommation électrique)"> (electricity consumption)</ml>.
        </p>
        <p class="whatif" v-if="method === 'flux'">
          <ml fr="Total CO2e (fabrication et transport) : ">Total CO2e (production and transport): </ml>
          <span class="value">{{toFixed(total_grey_CO2(),0)}}</span> kgCO2e
        </p>

        <p class="whatif" v-show="uncertainty" style="padding-left:1em">
          <ml fr="Fabrication et transport, intervalle :">Production and transport, range:</ml>
          [<span class="value">{{toFixed(grey_inf,0)}}</span> - <span class="value">{{toFixed(grey_sup,0)}}</span>]
          kgCO2e/{{$t('words.year')}}.
        </p>

        <template v-if="objective">
          <p class="whatif" v-if="method === 'stock'" v-html="$t('message.lifetime_saving', {amount: toFixed(total_grey_CO2()-total_grey_CO2('2')) } )">
          </p>
          <p class="whatif" v-if="method === 'flux'">
            Économies réalisables par l'augmentation de la durée de vie de mes équipements d'un facteur
            <span class="value">{{params.lifetime_factor}}</span>
            : <span class="value">{{toFixed(total_grey_CO2()-total_grey_CO2('2'))}}</span> kgCO2e par an.
          </p>
        </template>
      </tab>

      <tab :name="$t('title.data')" >
        <table style="width:100%" class="highlight">

          <tr><th style="width:33%"></th><th style="width:33%"></th><th style="width:34%"></th></tr>

          <tr><td><ml fr="Importer une liste d'équipements :">Import a device list:</ml></td>
              <td><input type="file" id="import_json_file" @change="import_json_device_list($event.target.files)" /></td>
              <td><span class="note">(voir <a href="ecodiag_example.json">example.json</a>)</span></td></tr>

          <tr><td><ml fr="Exporter la liste d'équipements :">Export the current device list:</ml></td>
              <td>
                <form id="export_form" @submit="export_json_device_list($event)">
                  <input type="text" class="filename" id="export_filename" value="my_device_list"/><span class="unit">.json</span>
                  <input id="export_submit" type="submit" value="Save"/>
                </form>
              </td>
              <td></td></tr>

          <tr class="blank"></tr>

          <tr><td><ml fr="Coût carbone d'1kWh électrique :">Electricity carbon intensity:</ml></td>
              <td><input v-model.number="params.kWh_to_CO2e" type="number" min="0.04" max="2" step="0.002" /> <span class="unit">kgCO<sub>2</sub>e/kWh</span></td>
              <td class="note"></td>
          </tr>

          <tr class="blank"></tr>

          <tr>
            <td><ml fr="Afficher les incertitudes :">Show uncertainty:</ml></td>
            <td><input type="checkbox" v-model="uncertainty" /> </td>
            <td></td>
          </tr>

            <tr v-show="uncertainty">
              <td><ml fr="Choix de l'intervalle de confiance :">Reported uncertainty range:</ml></td>
              <td> <input type="range" min="50" max="95" step="1" v-model.number="uncertainty_percent" /> <span v-html="uncertainty_percent"></span>%.</td>
              <td></td>
            </tr>

            <tr v-show="uncertainty">
              <td><ml fr="Incertitude de fabrication par défaut :">Default fabrication uncertainty:</ml></td>
              <td>&plusmn;<input v-model.number="params.default_uncertainty" type="number" min="0" max="100" step="1" size="4" /> <span class="unit">%</span></td>
              <td class="note">({{$t('words.stdev')}})</td>
            </tr>

            <!-- <tr v-show="uncertainty"><td><ml fr="Incertitude de durée de vie :">Lifetime uncertainty:</ml></td>
              <td>&plusmn;<input v-model="params.lifetime_uncertainty" type="number" min="0" max="10" step="0.5" size="4" /> <span class="unit">{{$t('words.year')}}</span></td>
              <td class="note">({{$t('words.stdev')}})</td>
            </tr> -->

          <tr class="blank"></tr>

          <tr>
            <td><ml fr="Définir/montrer un objectif :">Define/show objective:</ml></td>
            <td>
              <input type="checkbox" v-model="objective" />
            </td>
            <td></td>
          </tr>

            <tr v-show="objective"><td><ml fr="Facteur d'extension de la durée de vie :">Lifetime extension factor:</ml></td>
              <td><input v-model.number="params.lifetime_factor" type="number" min="1.1" max="4" step="0.1" /> <span class="unit">années</span></td>
              <td class="note">
                <ml fr="Utilisé pour simuler les impacts d'une augmentation de x">
                  Used to simulate the impacts of increasing by x
                </ml>
                <span v-text="params.lifetime_factor"></span>
                <ml fr=" de la durée de vie effective des équipements.">
                   the actual lifetime of each item.
                </ml></td>
            </tr>

          <tr class="blank"></tr>

          <tr>
            <td><ml fr="Méthode de calcul :">Compute method:</ml></td>
            <td style="padding-top: 5px; padding-bottom:5px;vertical-align:middle">
              <!-- <select v-model="method">
                <option v-for="key in method_list" :value="key" :key="key">
                  {{key}}
                </option>
              </select> -->
                <b-button @click="isMethodPickerActive=true" icon-right="pencil">{{$t('methods.' + method)}}</b-button>
            </td>
            <td></td>
          </tr>

          <tr v-show="method=='flux'"><td><ml fr="Durée d'amortissement :">Damping factor:</ml></td>
            <td><input v-model.number="params.damping_factor" type="number" min="1" max="9" step="1" /> <span class="unit">{{$t('words.years')}}</span></td>
            <td class="note">La liste des équipements fournis doit correspondre à la liste des achats des
              <span v-text="params.damping_factor"></span> années précédentes, indépendamment de la durée de vie réel des équipements.</td>
          </tr>

          <tr v-show="method=='flux'"><td><ml fr="Ignorer les dates d'achat :">Ignore purchase year:</ml></td>
            <td><input type="checkbox" v-model="params.ignore_year" /></td>
            <td class="note"></td>
          </tr>

          <tr v-show="method === 'flux' && !params.ignore_year"><td><ml fr="Année du bilan :">Account year:</ml></td>
            <td><input v-model.number="reference_year" type="number" min="2000" max="2100" step="1" /> </td>
            <td class="note"></td>
          </tr>

          <tr class="blank"></tr>

          <tr><td><ml fr="Télécharger le fichier de données :">Download data file:</ml></td>
            <td><a href="devices.js" target="_blank">devices.js</a></td>
            <td class="note"></td></tr>
        </table>

      </tab>

      <tab :name="$t('title.help')">
        <div class='content'>
          <p>
            Vous pouvez directement téléverser votre listing sous la forme d'un tableau au format <code>.csv</code> ou <code>.tsv</code>, c'est à dire dans un format texte où les colonnes sont séparées par une virgule ou une tabulation.
            L'outil va rechercher les informations dans les colonnes suivantes :
          </p>
          <ul>
            <li><b>Type</b>, identifiant la catégorie de l'item parmi (avec entre parenthèses quelques alias autorisés) : PC fixe (Desktop, PC, fixe, tour, unité centrale, station de travail, workstation), PC portable (laptop, portable, notebook), Serveur, Écran (screen, display), Vidéo projecteur, Tablette (pad), Smartphone (mobile), Imprimante, Borne wifi (Wifi hub), Téléphone IP, GPU, Disque dur, Clavier, Souris.</li>
            <!-- <li><b>Fabricant</b>, c'est à dire la marque de l'item, exemples : DELL, HP, Lenovo, ACER, Apple, etc.</li> -->
            <li><b>Modèle</b>, permettant d'identifier plus précisément l'item, exemples : Latitude 5280, PowerEdge T640, Precision Tower 3630, etc.</li>
            <li><b>Date d'achat</b>, où l'outil va rechercher l'année sur quatre chiffres, ex. <code>03/04/2020</code>, ou <code>3 avril 2020</code>, ou encore <code>2020</code>. <i>(optionnel)</i></li>
          </ul>
          <p>
            Le listing doit bien sûr fournir au minimum l'une des colonnes <code>Type</code> ou <code>Modèle</code>, ou encore mieux, les deux.
            La colonne <code>Date d'achat</code> est inutile dans la méthode par <i>inventaire</i>, et n'est donc potentiellement utile que pour la méthode par <i>liste des achats</i> dans l'éventualité où le listing téléversé contient plusieurs années.
          </p>
          <p>
            <b>Attention</b> : dans la méthode par <i>liste des achats</i>, si vous choisissez une période d'amortissement <code>N</code> supérieur à 1 an, alors le listing doit inclure les achats sur l'année du bilan plus les <code>N-1</code> années précédentes.
          </p>
          <p>
            <b>Astuces</b> :
            <ul>
              <li>Si les informations de type "Type" et "Modèle" sont confondues dans une seule colonne, vous pouvez simplement dédoubler cette colonne dans votre tableur avant export au format <code>.csv</code>.</li>
              <li>Si les information de type "Modèle" sont éparpillés entre plusieurs colonnes, vous pouvez les fusionner dans votre tableur favori avec une formule comme : <code>=CONTAT(B2, " ", C2)</code>.</li>
            </ul>
          </p>
        </div>
      </tab>

    </tabs>

  </tab>

  <tab :name="$t('title.about')" button-style="float:right;margin-right:52px">
    <div class="content">
    <about-ecodiag />
    </div>
  </tab>
</tabs>

<p class="footer">
  EcoDiag version %version_date%-<a href="https://gitlab.inria.fr/guenneba/ecodiag/-/commit/%version_hash%">%version_hash%</a> - un service <a href="https://ecoinfo.cnrs.fr/">ecoinfo</a>.
</p>

<b-modal
  :active.sync="isMethodPickerActive"
  has-modal-card
  trap-focus
  :destroy-on-hide="false"
  :can-cancel="[]"
  aria-role="dialog"
  aria-label="Methode de calcul"
  aria-modal>
  <template #default="props">
    <method-picker @close="props.close" @selected="on_method_select"></method-picker>
  </template>
</b-modal>

</div>
</template>

<script>

/* eslint-disable no-multi-spaces */

import { device_utils } from '../device_utils'
import { devices } from '../devices'

var default_kWh2CO2 = 0.084

export default {
  name: 'ecodiag',

  components: {
    'ml': () => import('@/components/ml.vue'),
    'tabs': () => import('@/components/tabs.vue'),
    'tab': () => import('@/components/tab.vue'),
    'device-table': () => import('@/components/hybrid_device_table.vue'),
    'chart': () => import('@/components/chart.vue'),
    'method-picker': () => import('@/components/method_picker.vue'),
    'about-ecodiag': () => import('@/components/about.vue')
  },

  mixins: [device_utils],

  data () {
    return {
      langs: ['en', 'fr'],

      devices_list: [],

      devices: devices,

      equiv_data: {
        coal: { factor: 1.0 / 3.0, unit: ' kg of ', unit_fr: ' kg de ' },
        solar_panel: { factor: 1.0 / (1000 * 0.160 * 0.944 * 0.9), unit: ' m&sup2; of ', unit_fr: ' m&sup2; de ' }
      },
      equiv_selected: 'coal',

      method_list: ['stock', 'flux'],
      method: undefined,
      isMethodPickerActive: true,

      reference_year: 2020,

      objective: false,
      uncertainty: false,
      uncertainty_percent: 71, // this reproduces the standard deviation with a symmetric range around the mean
      grey_inf: 0,
      grey_sup: 0
    }
  },

  mounted () {
    // this.uncertainty = true
    // this.devices_list =
    //   this.unpack_device_list([
    //     {'desktop/ecodiag_avg_PC':     0},
    //     {'desktop/avg_WS':             0},
    //     {'laptop/ecodiag_avg_laptop':  0},
    //     {'screen':                     0},
    //   ])
  },

  computed: {
    valid_devices_list () {
      return this.extract_valid_items(this.devices_list, this.method, this.reference_year)
    },
    plotdata () {
      var main_categories = ['desktop', 'screen', 'laptop', 'server', 'printer', 'other']

      var type_renamer = function (t) {
        if (main_categories.includes(t)) {
          return t
        } else {
          return 'other'
        }
      }

      var self = this
      var tr = function (x) {
        if (x in self.devices) {
          return self.tr_label(self.devices[x])
        } else {
          return self.$t('labels.' + x)
        }
      }
      var greydata1 = main_categories.map(function (x) { return { key: x, label: tr(x), val: 0 } })
      var greydata2 = this.clone_obj(greydata1)
      var usedata   = this.clone_obj(greydata1)
      var uncertainty_percent = this.uncertainty_percent
      var up = []
      if (this.uncertainty) {
        up = [95, uncertainty_percent, 50]
      }
      var infs = {}
      var sups = {}
      var means = {}
      main_categories.push('total')
      main_categories.forEach(function (el) {
        infs[el] = new Array(up.length); infs[el].fill(0)
        sups[el] = new Array(up.length); sups[el].fill(0)
        means[el] = 0
      })

      this.valid_devices_list.forEach(function (item) {
        const itemCO2 = this.compute_device_co2e(item, this.method, up)

        var key = type_renamer(item.type)
        means.total += itemCO2.grey
        means[key] += itemCO2.grey
        if (this.uncertainty) {
          for (var i = 0; i < up.length; ++i) {
            infs.total[i] += itemCO2.infs[i]
            sups.total[i] += itemCO2.sups[i]
            infs[key][i]  += itemCO2.infs[i]
            sups[key][i]  += itemCO2.sups[i]
          }
        }
        greydata1.find(x => x.key === key).val += itemCO2.grey
        greydata2.find(x => x.key === key).val += itemCO2.grey2

        usedata.find(x => x.key === key).val += itemCO2.use
      }.bind(this))

      let res = []

      if (this.uncertainty) {
        // cache inf/sup range:

        /* eslint-disable vue/no-side-effects-in-computed-properties */
        this.grey_inf = infs.total[1]
        this.grey_sup = sups.total[1]

        greydata1.uncertainty = { inf: infs.total[1], sup: sups.total[1], mean: means.total }
      }
      // greydata2.dim = 0.5;
      if (this.objective) {
        greydata1.widthPercent  = 0.7
        greydata1.offsetPercent = 0
        greydata2.widthPercent  = 0.25
        greydata2.offsetPercent = 0.75

        res.push({ key: 'grey', label: this.$t('labels.fabrication_vs_objective'), data: [greydata1, greydata2] })
      } else {
        res.push({ key: 'grey', label: this.$t('labels.fabrication'), data: [greydata1] })
      }
      if (this.method !== 'flux') {
        res.push({ key: 'use', label: this.$t('labels.use'), data: [usedata] })
      }
      return res
    }
  },

  methods: {

    total_grey_CO2: function (suffix) {
      var att = (suffix && suffix === '2') ? 'grey2' : 'grey'
      return this.valid_devices_list.reduce(function (res, item) {
        const itemCO2 = this.compute_device_co2e(item, this.method)
        return res + itemCO2[att]
      }.bind(this), 0)
    },

    total_elec_kWh: function () {
      return this.valid_devices_list.reduce(function (res, item) {
        return res + item.nb * this.get_yearly_consumption(item)
      }.bind(this), 0)
    },

    trAtt: function (obj, key) {
      var suffix = '_' + this.$i18n.locale
      var r = obj[key + suffix]
      if (!r) {
        r = obj[key]
        var rbis = this.$i18n.messages[this.$i18n.locale].words[r]
        if (rbis) { console.log('found ' + rbis); r = rbis }
      }
      return r
    },

    on_method_select (new_method) {
      if (this.method !== new_method) {
        this.method = new_method
      }
    },

    import_json_device_list (files) {
      if (files.length === 1) {
        var file = files[0]
        var reader = new FileReader()

        reader.onload = (function (/* f */) {
          return function (e) {
            var json_text = e.target.result
            // remove first line if needed:
            if (json_text.startsWith('var')) {
              json_text = json_text.split('\n').slice(1).join('\n')
            }
            // remove comments:
            json_text = JSON.minify(json_text)
            var imported_data = JSON.parse(json_text)

            if (imported_data.kWh2CO2) {
              this.params.kWh_to_CO2e = imported_data.kWh2CO2
            }

            this.devices_list = this.unpack_device_list(imported_data.devices)
          }.bind(this)
        }.bind(this))(file)

        reader.readAsText(file)
      }
    },

    export_json_device_list (e) {
      e.preventDefault()

      var d = { devices: this.pack_device_list(this.valid_devices_list) }
      if (this.params.kWh_to_CO2e !== default_kWh2CO2) {
        d['kWh2CO2'] = this.params.kWh_to_CO2e
      }

      var blob = new Blob([JSON.stringify(d, null, 2)], {
        'type': 'application/json'
      })
      var a = document.createElement('a')

      var filename = e.target.export_filename.value

      a.download = filename
      a.href = URL.createObjectURL(blob)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }
}
</script>
