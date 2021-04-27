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

    <chart :plotdata="plotdata"></chart>
    
    <tabs>

      <tab :name="$t('title.device_list')" :selected="true">
      
        <device-table
          :devicelist="devices_list"
          :method="method"
          :optional-columns="['grey']"
          :reference-year="reference_year" />
        <p></p>

        <p class="whatif" v-if="method === 'stock'">
          <ml fr="Bilan consommation électrique :">Total electricity consumption:</ml>
          <span class="value">{{toFixed(total_elec_kWh(),0)}}</span> kWh/{{$t('words.year')}},
          <ml fr="soit l'équivalent de la production de">which is equivalent to the production of</ml>
          <span class="value">{{ Math.round(total_elec_kWh() * equiv_data[equiv_selected].factor*10)/10 }}</span>
          <span v-html="trAtt(equiv_data[equiv_selected],'unit')" ></span>

          <select v-model="equiv_selected">
            <option v-for="(value,key) in equiv_data" :value="key" :key="key">
              {{ $t('words.'+key) }}
            </option>
          </select>.
        </p>

        <p class="whatif" v-if="method === 'stock'">
          <ml fr="Total CO2e annuel :">Total yearly CO2e:</ml>
          <span class="value">{{toFixed(total_elec_kWh()*params.kWh_to_CO2e + total_grey_CO2(),0)}}</span> kgCO2e/{{$t('words.year')}}
            = <span class="value">{{toFixed(total_grey_CO2(),0)}}</span>
            <ml fr="(fabrication et transport)">(production and transport)</ml>            
            + <span class="value">{{toFixed(total_elec_kWh()*params.kWh_to_CO2e,0)}}</span>
            <ml fr="(consommation électrique)">(electricity consumption)</ml>.
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

        <p class="whatif" v-html="$t('message.lifetime_saving', {amount: toFixed(total_grey_CO2()-total_grey_CO2('2')) } )">
        </p>

      </tab>

      <tab :name="$t('title.data')" >
        <table style="width:100%">

          <tr><th style="width:33%"></th><th style="width:30%"></th><th style="width:37%"></th></tr>

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
            <td>en béta test</td>
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
            <td>
              <select v-model="method">
                <option v-for="key in method_list" :value="key" :key="key">
                  {{key}}
                </option>
              </select>
            </td>
            <td></td>
          </tr>

            <tr v-show="method=='flux'"><td><ml fr="Durée d'amortissement :">Damping factor:</ml></td>
              <td><input v-model.number="params.damping_factor" type="number" min="1" max="9" step="1" /> <span class="unit">années</span></td>
              <td class="note">La liste des équipements fournis doit correspondre à la liste des achats des
                <span v-text="params.damping_factor"></span> années précédentes, indépendamment de la durée de vie réel des équipements.</td>
            </tr>

            <tr v-show="method=='flux'"><td><ml fr="Année du bilan:">Account year:</ml></td>
              <td><input v-model.number="reference_year" type="number" min="2000" max="2100" step="1" /> </td>
              <td class="note"></td>
            </tr>

          <tr class="blank"></tr>

          <tr><td><ml fr="Télécharger le fichier de données :">Download data file:</ml></td>
            <td><a href="devices.js" target="_blank">devices.js</a></td>
            <td class="note"></td></tr>
        </table>

      </tab>

    </tabs>

  </tab>

  <tab :name="$t('title.about')" button-style="float:right;margin-right:52px">
    <div class="content">
    <p>
      EcoDiag est un service EcoInfo (<a href="https://ecoinfo.cnrs.fr/ecodiag/">pour en savoir plus</a>).
    </p>

    <div class="warning">
      <p>
        Attention, les équivalents CO<sub>2</sub> calculés sont sujets à de très grandes incertitudes, notamment :
        <ul>
          <li>
            Les émissions dues à la <b>fabrication</b> des équipements peuvent varier du <b>simple au triple</b> en fonction du modèle précis, mais aussi de ses options.
            Par exemple, <a href="https://www.apple.com/environment/">Apple</a> donne le Mac-Pro-2019 à 690 kg.CO2e/an (fabrication et usage confondu) pour sa version de base,
            contre 1750 kg.CO2e/an pour sa version avec toutes les options.<br/>&nbsp;
          </li>

          <li>
            La <b>consommation électrique réelle</b> des équipements peut elle aussi varier du simple au triple en fonction de leur usage effectif.
            Pour un calcul précis de cette quantité il est indispensable de passer par une mesure physique sur une période suffisamment longue et représentative,
            que ce soit au niveau d'un bâtiment via l'installation d'un compteur secondaire
            ou bien au niveau d'un individu via une prise compteur.
          </li>
        </ul>
      </p>
    </div>

    L'ensemble des chiffres utilisé pour cette simulation provient du travail du groupe EcoDiag sur la base des données fournies par les sources listées ci-dessous.
    Ces chiffres sont susceptibles d'évoluer régulièrement au court des mises à jour de EcoDiag.

    <h2>Consommation réelle de mes serveurs</h2>
    <p>
      Cet outil vous permet de facilement renseigner la consommation réelle de vos équipement via la colone "usage".
      Pour les serveurs DELL vous pouvez facilement l'obtenir en suivant ce <a href="https://ecoinfo.cnrs.fr/2019/09/13/mesurer-la-consommation-electrique-dun-serveur/">guide</a>.</p>

    <h2 class="title">Sources</h2>
    <ul>
      <li><a href="https://corporate.delltechnologies.com/en-ie/social-impact/advancing-sustainability/sustainable-products-and-services/product-carbon-footprints.htm#tab0=3">DELL</a></li>
      <li><a href="https://www.apple.com/environment/">Apple</a></li>
      <li><a href="https://h22235.www2.hp.com/hpinfo/globalcitizenship/environment/productdata/ProductCarbonFootprintnotebooks.html">HP</a></li>
      <li><a href="https://www.lenovo.com/us/en/compliance/eco-declaration">Lenovo</a></li>
      <li><a href="https://www.cfp-japan.jp/english/list/">Imprimantes Laser Canon et Xerox</a></li>
      <li><a href="https://csr.lexmark.com/env-epd.php">Lexmark</a></li>
      <li><a href="https://www.seagate.com/fr/fr//global-citizenship/life-cycle-assessment/">Seagate</a></li>
      <li><a href="https://www.bilans-ges.ademe.fr/">ADEME - Base carbone</a></li>
      <li><a href="https://www.ademe.fr/sites/default/files/assets/documents/livre-blanc-consommation-energetique-equipements-informatique-2015.pdf">ADEME - Livre blanc "Consommation énergétique des équipements informatiques en milieu professionnel" (2015)</a></li>
    </ul>

    <p>
      Les analyses réalisées par DELL, HP, Lenovo, ou encore CISCO, s'appuient sur l'outil d'analyse simplifiée
      <a href="https://msl.mit.edu/projects/paia/paia-research-approach">PAIA</a> du MIT,
      dont les résultats doivent être pris avec beaucoup de recul, tant les incertitudes sont grandes, comme nous le rappel les auteurs
      de PAIA eux même dans ce document :
      <a href="https://www.lenovo.com/us/en/social_responsibility/PAIA_Intended_Use">Intended Uses and Limitations of the PAIA Model</a>
    </p>

    <h2>Améliorations à venir</h2>
    <ul>
      <li>Calcul et report des incertitudes</li>
      <li>Rendre transparent et modifiable l'ensemble des chiffres utilisés</li>
      <li>Définir plusieurs profils d'usage</li>
      <li>Ajouter un outil pour mesurer l'usage des supercalculateurs de l'ESR</li>
      <li>Ajouter un outil sur l'usage d'internet et services cloud</li>
    </ul>
    </div>
  </tab>
</tabs>

<p class="footer">
  EcoDiag version %version_date%-<a href="https://gitlab.inria.fr/guenneba/ecodiag/-/commit/%version_hash%">%version_hash%</a> - un service <a href="https://ecoinfo.cnrs.fr/">ecoinfo</a>.
</p>

<b-modal
  v-model="isMethodPickerActive"
  has-modal-card
  trap-focus
  :destroy-on-hide="true"
  :can-cancel="[]"
  aria-role="dialog"
  aria-label="Methode de calcul"
  aria-modal>
  <template #default="props">
    <method-picker @close="props.close" @selected="e => method=e"></method-picker>
  </template>
</b-modal>

</div>
</template>

<script>

var default_kWh2CO2 = 0.084;

import { device_utils } from '../device_utils'
import { devices } from '../devices'

export default {
  name: 'ecodiag',

  components: {
    'ml': () => import('@/components/ml.vue'),
    'tabs': () => import('@/components/tabs.vue'),
    'tab': () => import('@/components/tab.vue'),
    'device-table': () => import('@/components/hybrid_device_table.vue'),
    'chart': () => import('@/components/chart.vue'),
    'method-picker': () => import('@/components/method_picker.vue')
  },

  mixins: [device_utils],

  data() {
    return {
      langs: ['en','fr'],

      devices_list: [],
      
      devices:devices,

      equiv_data: {
        coal: {factor: 1./3., unit:" kg of ", unit_fr:" kg de "},
        solar_panel: {factor: 1./(1000*0.160*0.944*0.9), unit:" m&sup2; of ", unit_fr:" m&sup2; de "}
      },
      equiv_selected: 'coal',

      method_list: ['stock','flux'],
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

  mounted() {
    // this.uncertainty = true;
    // this.devices_list = 
    //   this.unpack_device_list([
    //     {'desktop/ecodiag_avg_PC':     0},
    //     {'desktop/avg_WS':             0},
    //     {'laptop/ecodiag_avg_laptop':  0},
    //     {'screen':                     0},
    //   ]);
  },

  computed: {
    valid_devices_list() {
      return this.extract_valid_items(this.devices_list, this.method, this.reference_year)
    },
    plotdata() {

      var main_categories =['desktop','screen','laptop','server','printer','other'];

      var type_renamer = function(t) {
        if(main_categories.includes(t))
          return t;
        else
          return 'other';
      }

      var self = this
      var tr = function(x) {
        if (x in self.devices) {
          return self.tr_label(self.devices[x])
        } else {
          return self.$t('labels.'+x)
        }
      }
      var greydata1 = main_categories.map(function(x) {return {key:x, label: tr(x), val:0};})
      var greydata2 = this.clone_obj(greydata1);
      var usedata   = this.clone_obj(greydata1);
      var uncertainty_percent = this.uncertainty_percent;
      var up = [];
      if(this.uncertainty)
       up = [95,uncertainty_percent,50];
      var infs = {};
      var sups = {};
      var means = {};
      main_categories.push('total');
      main_categories.forEach(function(el) {
        infs[el]=new Array(up.length); infs[el].fill(0);
        sups[el]=new Array(up.length); sups[el].fill(0);
        means[el] = 0;
      });

      this.valid_devices_list.forEach(function(item) {
        const itemCO2 = this.compute_device_co2e(item, this.method, up);

        var key = type_renamer(item.type);
        means.total += itemCO2.grey;
        means[key] += itemCO2.grey;
        if(this.uncertainty) {
          for(var i=0; i<up.length; ++i) {
            infs.total[i] += itemCO2.infs[i];
            sups.total[i] += itemCO2.sups[i];
            infs[key][i]  += itemCO2.infs[i];
            sups[key][i]  += itemCO2.sups[i];
          }
        }
        greydata1.find(x => x.key==key).val += itemCO2.grey;
        greydata2.find(x => x.key==key).val += itemCO2.grey2;
        
        usedata  .find(x => x.key==key).val += itemCO2.use;
      }.bind(this));

      let res = []
        
      if(this.uncertainty) {
        // cache inf/sup range:

        /* eslint-disable vue/no-side-effects-in-computed-properties */
        this.grey_inf = infs.total[1];
        this.grey_sup = sups.total[1];

        greydata1.uncertainty = {inf:infs.total[1], sup:sups.total[1], mean:means.total};
      }
      // greydata2.dim = 0.5;
      if (this.objective) {
        greydata1.widthPercent  = 0.7;
        greydata1.offsetPercent = 0;
        greydata2.widthPercent  = 0.25;
        greydata2.offsetPercent = 0.75;

        res.push({key:'grey', label:this.$t('labels.fabrication_vs_objective'), data:[greydata1, greydata2] })
      } else {
        res.push({key:'grey', label:this.$t('labels.fabrication'), data:[greydata1] })
      }
      if (this.method !== 'flux') {
        res.push({key:'use',  label:this.$t('labels.use'), data:[usedata]})
      }
      return res
    }
  },

  methods: {

    total_grey_CO2: function(suffix) {
      var att = (suffix &&suffix==2) ? 'grey2' : 'grey'
      return this.valid_devices_list.reduce(function(res,item){
        const itemCO2 = this.compute_device_co2e(item, this.method)
        return res + itemCO2[att]
      }.bind(this), 0)
    },

    total_elec_kWh: function() {
      return this.valid_devices_list.reduce(function(res,item){
        return res + item.nb * this.get_yearly_consumption(item)
      }.bind(this), 0)
    },
    
    trAtt: function(obj,key) {
      var suffix = "_" + this.$i18n.locale
      var r = obj[key+suffix]
      if(!r) {
        r = obj[key]
        var rbis = this.$i18n.messages[this.$i18n.locale].words[r]
        if(rbis) {console.log('found ' + rbis); r = rbis}
      }
      return r
    },

    import_json_device_list(files) {
      if(files.length==1){
        var file = files[0];
        var reader = new FileReader();

        reader.onload = (function(/* f */) {
            return function(e) {
              var json_text = e.target.result;
              // remove first line if needed:
              if(json_text.startsWith("var"))
                json_text = json_text.split("\n").slice(1).join("\n");
              // remove comments:
              json_text = JSON.minify(json_text);
              var imported_data = JSON.parse(json_text);

              if(imported_data.kWh2CO2)
                this.params.kWh_to_CO2e = imported_data.kWh2CO2;
              
              this.devices_list = this.unpack_device_list(imported_data.devices);
            }.bind(this);
          }.bind(this))(file);

        reader.readAsText(file);
      }
    },

    export_json_device_list(e) {
      e.preventDefault();

      var d = {devices: this.pack_device_list(this.valid_devices_list)};
      if(this.params.kWh_to_CO2e!=default_kWh2CO2) {
        d['kWh2CO2'] = this.params.kWh_to_CO2e;
      }

      var blob = new Blob([JSON.stringify(d, null, 2)], {
        "type": "application/json"
      });
      var a = document.createElement("a");
      
      var filename = e.target.export_filename.value;
      
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  }
}
</script>

