
/* eslint-disable */

// import { i18n } from '@/plugins/i18n.js'
import * as d3 from "d3-dsv"
import { devices } from './devices.js'
import { v4 as uuidv4 } from 'uuid'

function get_default_model_ecodiag (type) {
  if (devices[type] && devices[type].models) {
    var res = {
      'desktop': 'ecodiag_avg_PC',
      'printer': 'office_40_99kg' }[type]
    if (res) { return res }
    return 'default'
  } else {
    return undefined
  }
}

var params = {
  includes_empty_year: false, // used in the "flux" method
  damping_factor: 1,          // in years, used in the "flux" method
  ignore_year: false,         // used in the "flux" method
  lifetime_factor: 1.5,       // used in the "flux" method to simulate a longer lifetime, or in the "stock" method to compute the default extended lifetime
  default_uncertainty: 30,
  lifetime_uncertainty: 1,
  kWh_to_CO2e: 0.084,
  get_default_model: get_default_model_ecodiag
}

export const device_utils = {
  data () {
    return {
      status: {
        user_ko: 2,
        user_ok: 4,
        unknown: 6,
        unknown_year: 7,
        invalid_year: 8,
        csv_ok: 10
      },
      params: params
    }
  },

  methods: {

    clone_obj(x) {
      var res;
      res = Array.isArray(x) ? [] : {};
      for (let key in x) {
        let v = x[key]
        res[key] = (typeof v === "object") ? this.clone_obj(v) : v
      }
      return res;
    },

    // Get an element's label in locale language using:
    //  - obj.label_<local>, e.g., obj.label_fr or obj.label_en
    //  - or obj.label
    //  - or $t(obj) if obj is a string
    //  - or fallback
    tr_label (obj,fallback) {
      if (typeof obj === 'string') {
        return this.$i18n.t(translate)
      }
      var result = obj['label_'+this.$i18n.locale]
      if (!result)
        result = obj.label
      if (!result)
        result = fallback
      return result
    },

    capitalize (str) {
      return str[0].toUpperCase() + str.substring(1)
    },

    // Returns "type/model" unless model is null or "default" in which case we simply return type
    make_device_name (type, model) {
      if (model && model != '' && model != 'default') { return type + '/' + model }
      return type
    },

    // If name matches "type/model" then return ["type","model"]
    // otherwise check whether "name" is a valid device model,
    //    if so return ["type","name"]
    //    otherwise "name" is a 'type' and it returns ["name"]
    device_name_to_type_model (name) {
      var type_model = name.split('/')
      if (type_model.length == 2 || ((typeof purchase_types !== 'undefined') && type_model[0] in purchase_types)) { return type_model }
      // search within devices
      for (var k in devices) {
        let model = type_model[0]
        let d = devices[k]
        if (d.models && model in d.models) { return [k, model] }
      }

      return type_model
    },

    // Returns the attribute "attr" from a type/model pair
    // (model is optional)
    get_device_attribute (type, model, attr) {
      var res = undefined
      var device = devices[type]
      if (device) {
        res = device[attr]
        if (model && model != 'default' && devices[type].models && model in devices[type].models && devices[type].models[model][attr]) {
          res = devices[type].models[model][attr]
        }
      }
      return res
    },

    // Returns grey CO2 factor from a type/model pair
    // (model is optional)
    get_device_factor (type, model) {
      function getmean (el) {
        if (el.mean) { return el.mean } else { return el }
      }
      let getstd = function (el) {
        if (el.std) { return el.std } else { return params.default_uncertainty / 100 } // default is 30%
      }.bind(this)

      if (!(type in devices)) {
        return {mean: 0, std: 0}
      }
      
      let device_CO2 = devices[type].grey_CO2
      let mean = getmean(device_CO2)
      let std = getstd(device_CO2)
      if (model && model != 'default') {
        let model_CO2
        if (devices[type].models[model].grey_CO2) {
          model_CO2 = devices[type].models[model].grey_CO2
        } else {
          model_CO2 = devices[type].models[model]
        }
        mean = getmean(model_CO2)
        std = getstd(model_CO2)
      }
      return { mean: mean, std: std }
    },

    // Shortcut to get_device_attribute (obsolete)
    get_yearly_consumption (item) {
      return this.get_device_attribute(item.type, item.model, 'yearly_consumption')
    },

    create_device_item (type, params) {
      if (!params)
        params = {}
      let item = {
        id: uuidv4(),
        _type: null,
        _model: null,
        nb: 1,
        lifetime: null,
        lifetime2: null,
        year: null,
        score: 0,
        details: []
      }

      let self = this
      Object.defineProperty(item, 'type', {
        set : function(v){
          if(item._type != v) {
            item._type = v
            item.model = self.get_default_model(item._type)
            self.update_item_from_type_and_model(item)
          }
        },
        get : function () { return item._type }
      })

      Object.defineProperty(item, 'model', {
        set : function (v){
          if(item._model != v) {
            item._model = v
            self.update_item_from_type_and_model(item)
          }
        },
        get : function () { return item._model }
      })

      item.type = type // this automatically sets model, lifetime, lifetime2, yearly_consumption, and usage from default values
      // now, let's update the model (this also sets lifetime, lifetime2, yearly_consumption, and usage from default values)
      if (params.model && type in devices && devices[type].models && params.model in devices[type].models) {
        item.model = params.model
      }
      // now, let's update them if provided by params,
      // that is, copy all parameters but 'type' and 'model':
      for (let key in params) {
        if (key !== 'type' && key !== 'model' && key !== '_type' && key !== '_model') {
          const val = params[key]
          item[key] = val
        }
      }

      return item
    },

    // [obsolete]
    // Returns a copy of item with type as 'type', 'model' as model,
    // and other attributes copied from the input item if available,
    // or gathered from the database otherwise.
    consolidate_device_item (type, model, item) {
      const lifetime = item.lifetime ? item.lifetime : this.get_device_attribute(type, model, 'duration')
      let res = {
        type: type,
        model: model,
        nb: item.nb ? item.nb : item,
        lifetime: lifetime,
        lifetime2:          item.lifetime2          ? item.lifetime2          : lifetime * (+params.lifetime_factor),
        yearly_consumption: item.yearly_consumption ? item.yearly_consumption : this.get_device_attribute(type, model, 'yearly_consumption'),
        usage:              item.usage              ? item.usage              : this.get_device_attribute(type, model, 'usage')
      }

      return res
    },

    update_item_from_type_and_model: function (item) {
      item.lifetime = this.get_device_attribute(item.type, item.model, 'duration')
      item.lifetime2 = item.lifetime * (+params.lifetime_factor)
      item.yearly_consumption = this.get_device_attribute(item.type, item.model, 'yearly_consumption')
      item.usage = this.get_device_attribute(item.type, item.model, 'usage')
    },

    get_default_model (type) {
      return params.get_default_model(type)
    },

    is_empty_year(y) {
      return (!y) || y === ''
    },
    
    is_valid_year (y, method, ref_year) {
      return method === 'stock' ||
             params.ignore_year || 
             (params.includes_empty_year && this.is_empty_year(y)) || (y <= ref_year && y > (ref_year - params.damping_factor))
    },

    compute_status: function (item, method, ref_year) {
      /* eslint-disable indent */
      let self = this
      let check_year = function (ok) {
        return (!self.is_valid_year(item.year, method, ref_year)) ? (
          self.is_empty_year(item.year) ? self.status.unknown_year : self.status.invalid_year)
        : ok
      }
      if (item.details.filter(e => Boolean(e.csvdata)).length === 0) {
        return Object.keys(devices).includes(item._type) ? check_year(this.status.user_ok)
                : this.status.user_ko
      } else {
        return item.score < 1 ? this.status.unknown
                : check_year(this.status.csv_ok)
      }
    },

    is_valid (item, method, ref_year) {
      let status = this.compute_status(item, method, ref_year)
      return item.score >= 0 && ((status === this.status.user_ok) || (status === this.status.csv_ok))
    },

    extract_valid_items (items, method, ref_year) {
      let self = this
      return items.filter(e => self.is_valid(e, method, ref_year))
    },

    // Computes the estimated CO2e emissions of the input item,
    // as well as the inferior/superior bounds for the provided confidences (optional)
    // - method should be either 'stock' or 'flux'
    compute_device_co2e (item, method, confidences) {
      const device_factor = this.get_device_factor(item.type, item.model)
      const lt = (method == 'stock') ? item.lifetime : +params.damping_factor
      const greyCO2 = item.nb * device_factor.mean / lt

      const lt_bis = method == 'stock' ? item.lifetime2 : (+params.damping_factor * (+params.lifetime_factor))
      const greyCO2_bis = item.nb * device_factor.mean / lt_bis

      let infs = []
      let sups = []
      if (confidences) {
        const distrib = this.LogNormalFromMeanAndRelStdev(device_factor.mean, device_factor.std)

        infs = Array(confidences.length)
        sups = Array(confidences.length)

        for (var i = 0; i < confidences.length; ++i) {
          infs[i] = item.nb * distrib.inv(0.5 - 0.5 * confidences[i] / 100) / lt
          sups[i] = item.nb * distrib.inv(0.5 + 0.5 * confidences[i] / 100) / lt
        }
      }
      const useCO2 = item.nb * this.get_yearly_consumption(item) * params.kWh_to_CO2e

      return {
        grey: greyCO2, // mean
        infs: infs,
        sups: sups,

        use: useCO2,

        grey2: greyCO2_bis // reduction objective
      }
    },

    pack_device_list (d) {
      var res = []
      d.forEach(function (x) {
        var item = {}
        item[this.make_device_name(x.type, x.model)] = { nb: x.nb, lifetime: x.lifetime }
        res.push(item)
      }.bind(this))
      return res
    },

    unpack_device_list (d) {
      var res = []
      d.forEach(function (x) {
        let item_name = Object.keys(x)[0]
        let item_data = Object.values(x)[0]

        let type_model = this.device_name_to_type_model(item_name)
        let type = type_model[0]
        let model = 'default'

        if (type_model.length == 2) { model = type_model[1] }

        res.push(this.create_device_item(type, {nb: item_data, model: model}))
      }.bind(this))
      return res
    },

    // item is modified in-place and returned
    process_csv_raw_item_regex (item, header_map) {
      let score = 0

      item['score'] = 0
      item['type']  = ''
      item['model'] = ''

      const csvitem = item.csvdata

      for (let dev_key in devices) {
        const dev = devices[dev_key]
        let dev_score = 0
        let mod_score = 0
        if (dev.regex && header_map.in_type && csvitem[header_map.in_type]) {
          if (csvitem[header_map.in_type].search(dev.regex) >= 0) {
            dev_score = 1
            // console.log("found "+dev_key+" in "+csvitem[header_map.in_type]);
          }
        }
        if (dev_score >= score) {
          // otherwise we have no chance to find a better match

          if (dev_score > 0 && score == 0) {
            // we already found a better match
            score = dev_score
            item['score'] = score
            item['type']  = dev_key
            item['model'] = this.get_default_model(dev_key)
          }

          if (dev.models && header_map.in_model && csvitem[header_map.in_model]) {
            for (var m_key in dev.models) {
              const m = dev.models[m_key]
              if (m.regex) {
                if (csvitem[header_map.in_model].search(m.regex) >= 0) {
                  mod_score = 1
                  // console.log("found "+m_key+" in "+csvitem[header_map.in_model]);
                }
                if (dev_score + mod_score > score) {
                  score = dev_score + mod_score
                  item['score'] = score
                  item['type']  = dev_key
                  item['model'] = m_key
                  if (score == 2) { return item } else { break }
                }
              }
            }
          }
        }
      }

      return item
    },

    // Search for brand, type, model, and purchase year columns
    // within csv_data.columns, and return the matches as
    // {in_brand,in_type,in_model,in_date}
    csv_parse_headers (csv_data) {
      var find_header = function (regex) {
        for (var k in csv_data.columns) {
          var name = csv_data.columns[k]
          if (name.search(regex) >= 0) { return name }
        }
        return null
      }

      return {
        in_brand: find_header(/(fabricant|brand|marque)/i),
        in_type:  find_header(/(type|cat.gorie|kind)/i),
        in_model: find_header(/mod.le/i),
        in_date:  find_header(/date.*(achat|acquisition)/i)
      }
    },

    // For each row i,
    //    extract year from:
    //      csv_data[i].csvdata[in_date]
    //    and store it in:
    //      csv_data[i].year
    //
    // NOTE: csv_data is modified in-place!
    csv_parse_dates (csv_data, in_date) {
      for (var item of csv_data) {
        item['year'] = ''
        if (in_date) {
          const date = item.csvdata[in_date]

          if (date) {
            const res = date.match(/\d{4}/)
            if (res && res.length > 0) { item['year'] = res[0] }
          }
        }
      }
    },

    // Merge rows of csv_data having the exact same key
    // and record the number of items within csv_data[i].nb
    csv_merge_wrt_keys (csv_data) {
      // sort items
      csv_data = csv_data.sort((a, b) => a.key.localeCompare(b.key))

      // insert while summing up duplicates
      var new_data = []
      for (let item of csv_data) {

        // skip empty lines
        if (item.key === '') {
          continue
        }
        
        if (!('nb' in item)) {
          item.nb = 1
        }
        if (new_data.length > 0 && new_data[new_data.length - 1].key == item.key) {
          new_data[new_data.length - 1].nb += item.nb
        } else {
          new_data.push(item)
        }
      }
      if (csv_data.columns) { new_data.columns = csv_data.columns }
      if (csv_data.header_map) { new_data.header_map = csv_data.header_map }
      return new_data
    },

    // Merge rows of csv_data having the exact same year, brand, type and model,
    // and record the number of items within csv_data[i].nb
    csv_merge_raw_items (csv_data, header_map) {
      // create keys
      var ukey = 1000
      for (var i in csv_data) {
        let item = csv_data[i]
        let key = ''
        const csvitem = item.csvdata
        
        if (header_map.in_brand && csvitem[header_map.in_brand]) { key = key.concat(csvitem[header_map.in_brand]) }
        if (header_map.in_type && csvitem[header_map.in_type]) { key = key.concat(csvitem[header_map.in_type]) }
        if (header_map.in_model && csvitem[header_map.in_model]) { key = key.concat(csvitem[header_map.in_model]) }

        if (!this.is_empty_year(item['year'])) {
          key = key.concat(item['year'])
        } else {
          if (key !== '') {
            key = key.concat(Number.toString(ukey))
            ukey += 1
          }
        }
        
        item['key'] = key
      }

      return this.csv_merge_wrt_keys(csv_data)
    },

    parse_raw_csv (csv_text) {
      // Find separator from first line
      let header_line = csv_text.split('\n')[0]
      let separators = [',', ';', '\t']
      let best_sep = undefined
      let best_sep_count = 0
      for (let sep of separators) {
        let count = (header_line.match(new RegExp(sep, "gi")) || []).length
        if (count > best_sep_count) {
          best_sep_count = count
          best_sep = sep
        }
      }
      if (!best_sep) {
        return [[], {}, 'bad separator']
      }

      let psv = d3.dsvFormat(best_sep)
      let csv_data = psv.parse(csv_text)

      let header_map = this.csv_parse_headers(csv_data)

      for (let i in csv_data) {
        let item = csv_data[i]
        csv_data[i] = {csvdata: item}
      }

      if (!(header_map.in_type || header_map.in_model)) {
        return [[], header_map, 'no type or model']
      }

      // console.log(csv_data['header_map']);
      if (header_map.in_date) {
        this.csv_parse_dates(csv_data, header_map.in_date)
      }
      csv_data = this.csv_merge_raw_items(csv_data, header_map)

      for (let i in csv_data) {
        let item = csv_data[i]
        item = this.process_csv_raw_item_regex(item, header_map)
        csv_data[i] = this.create_device_item(item.type, item)
      }

      // sort according to scores
      csv_data = csv_data.sort((b, a) => a.score - b.score)

      return [csv_data, header_map, 'ok']
    },

    LogNormalFromMeanAndRelStdev (mean, relative_stdev) {
      var si2 = Math.log(Math.pow(relative_stdev, 2) + 1)
      return this.LogNormal(Math.log(mean) - 0.5 * si2, Math.sqrt(si2))
    },

    my_erfinv (x) {
      var z = 0
      var a = 0.147 // = ((8*(Math.PI - 3)) / ((3*Math.PI)*(4 - Math.PI)));
      var sign_x
      if (x == 0) {
        sign_x = 0
      } else if (x > 0) {
        sign_x = 1
      } else {
        sign_x = -1
      }

      if (x != 0) {
        var tmp1 = Math.log(1 - x * x)
        var tmp2 = tmp1 / 2 + (2 / (Math.PI * a))
        z = Math.sqrt(Math.sqrt((tmp2 * tmp2) - tmp1 / a) - tmp2) * sign_x
      }
      return z
    },

    LogNormal (mu, sigma) {
      this.mu = mu
      this.sigma = sigma

      this.pdf = function (x) {
        return Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma)) / (x * sigma * Math.sqrt(2 * Math.pi))
      }

      this.cdf = function (x) {
        return 0.5 * 0.5 * Math.erf((Math.log(x) - mu) / (Math.sqrt(2) * sigma))
      }

      this.inv = function (p) {
        return Math.exp(mu + Math.sqrt(2 * sigma * sigma) * this.my_erfinv(2 * p - 1))
      }

      return this
    },

    toFixed(value, precision) {
      var power = Math.pow(10, precision || 0)
      return Math.round(value * power) / power
    }

  }

}
