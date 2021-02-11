

/* export */ const device_utils = {
  data () {
    return {
      params: {
        damping_factor: 1, // in years, used in the "flux" method
        lifetime_factor: 1.5, // used in the "flux" method to simulate a longer lifetime, or in the "stock" method to compute the default extended lifetime
        default_uncertainty: 30,
        lifetime_uncertainty: 1
      }
    }
  },

  methods: {

    // returns "type/model" unless model is null or "default" in which case we simply return type
    make_device_name (type, model) {
      if (model && model != '' && model != 'default') { return type + '/' + model }
      return type
    },

    // if name matches "type/model" return ["type","model"]
    // otherwise check whether "name" is a valid device model,
    //    if so return ["type","name"]
    //    otherwise "name" is a type and return ["name"]
    device_name_to_type_model (name) {
      var type_model = name.split('/')
      if (type_model.length == 2 || ((typeof purchase_types !== 'undefined') && type_model[0] in purchase_types)) { return type_model }
      // search within devices
      for (var k in devices) {
        var model = type_model[0]
        var d = devices[k]
        if (d.models && model in d.models) { return [k, model] }
      }

      return type_model
    },

    // returns grey CO2 factor from a type/model pair
    // - model is optional
    get_device_factor (type, model) {
      function getmean (el) {
        if (el.mean) { return el.mean } else { return el }
      }
      getstd = function (el) {
        if (el.std) { return el.std } else { return this.params.default_uncertainty / 100 } // default is 30%
      }.bind(this)
      var mean = conv.to_CO2[type]
      var device_CO2 = devices[type].grey_CO2
      var std = getstd(device_CO2)
      if (!mean) { mean = getmean(device_CO2) }
      if (model && model != 'default') {
        var model_CO2
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

    get_yearly_consumption (item) {
      if (item.yearly_consumption) { return item.yearly_consumption } else { return get_device_attribute(item.type, item.model, 'yearly_consumption') }
    },

    // returns the attribute "attr" from a type/model pair
    // - model is optional
    get_device_attribute (type, model, attr) {
      var res = undefined
      var device = devices[type]
      if (device) {
        res = device[attr]
        if (model && model != 'default' && devices[type].models[model][attr]) {
          res = devices[type].models[model][attr]
        }
      }
      return res
    },

    consolidate_device_item (type, model, item) {
      const lifetime = item.lifetime ? item.lifetime : this.get_device_attribute(type, model, 'duration')
      return {
        type: type,
        model: model,
        nb: item.nb ? item.nb : item,
        lifetime: lifetime,
        lifetime2:          item.lifetime2          ? item.lifetime2          : lifetime * (+this.params.lifetime_factor),
        yearly_consumption: item.yearly_consumption ? item.yearly_consumption : this.get_device_attribute(type, model, 'yearly_consumption'),
        usage:              item.usage              ? item.usage              : this.get_device_attribute(type, model, 'usage')
      }
    },

    get_default_model (type) {
      if (devices[type].models) {
        var res = {
          'desktop': 'ecodiag_avg_PC',
          'laptop': 'ecodiag_avg_laptop',
          'printer': 'office_40_99kg' }[type]
        if (res) { return res }
        return 'default'
      } else {
        return undefined
      }
    },

    compute_device_co2e (item, method, confidences) {
      const device_factor = this.get_device_factor(item.type, item.model)
      const lt = (method == 'stock') ? item.lifetime : +this.params.damping_factor
      const greyCO2 = item.nb * device_factor.mean / lt

      const lt_bis = method == 'stock' ? item.lifetime2 : (+this.params.damping_factor * (+this.params.lifetime_factor))
      const greyCO2_bis = item.nb * this.get_device_factor(item.type, item.model).mean / lt_bis

      if (confidences) {
        const distrib = this.LogNormalFromMeanAndRelStdev(device_factor.mean, device_factor.std)

        infs = Array(confidences.length)
        sups = Array(confidences.length)
        for (var i = 0; i < confidences.length; ++i) {
          infs[i] = item.nb * distrib.inv(0.5 - 0.5 * confidences[i] / 100) / lt
          sups[i] = item.nb * distrib.inv(0.5 + 0.5 * confidences[i] / 100) / lt
        }
      }
      const useCO2 = item.nb * this.get_yearly_consumption(item) * conv.to_CO2.elec

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
      })
      return res
    },

    unpack_device_list (d) {
      var res = []
      d.forEach(function (x) {
        var item_name = Object.keys(x)[0]
        var item_data = Object.values(x)[0]

        var type_model = this.device_name_to_type_model(item_name)
        var type = type_model[0]
        var model = 'default'

        if (type_model.length == 2) { model = type_model[1] }

        res.push(this.consolidate_device_item(type, model, item_data))
      }.bind(this))
      return res
    },

    process_csv_raw_item_regex (item, header_map) {
      var score = 0

      item['score'] = 0
      item['type']  = ''
      item['model'] = ''

      for (var dev_key in devices) {
        const dev = devices[dev_key]
        var dev_score = 0
        var mod_score = 0
        if (dev.regex && header_map.in_type && item[header_map.in_type]) {
          if (item[header_map.in_type].search(dev.regex) >= 0) {
            dev_score = 1
            // console.log("found "+dev_key+" in "+item[header_map.in_type]);
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

          if (dev.models && header_map.in_model && item[header_map.in_model]) {
            for (var m_key in dev.models) {
              const m = dev.models[m_key]
              if (m.regex) {
                if (item[header_map.in_model].search(m.regex) >= 0) {
                  mod_score = 1
                  // console.log("found "+m_key+" in "+item[header_map.in_model]);
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
    // within csv_data.columns, and store the matches within
    // csv_data['header_map'].{in_brand,in_type,in_model,in_date}
    // -- csv_data is modified in-place --
    csv_parse_headers (csv_data) {
      var find_header = function (regex) {
        for (var k in csv_data.columns) {
          var name = csv_data.columns[k]
          if (name.search(regex) >= 0) { return name }
        }
        return null
      }

      csv_data['header_map'] = {
        in_brand: find_header(/(fabricant|brand|marque)/i),
        in_type:  find_header(/(type|cat.gorie|kind)/i),
        in_model: find_header(/mod.le/i),
        in_date:  find_header(/date.*(achat|acquisition)/i)
      }
    },

    // For each i,
    //    extract year from:
    //      csv_data[i][csv_data.header_map.in_date]
    //    and store it in:
    //      csv_data[i].year
    // -- csv_data is modified in-place --
    csv_parse_dates (csv_data) {
      for (var i in csv_data) {
        var item = csv_data[i]
        item['year'] = ''
        if (csv_data.header_map.in_date) {
          const in_date = item[csv_data.header_map.in_date]

          if (in_date) {
            const res = in_date.match(/\d{4}/)
            if (res && res.length > 0) { item['year'] = res[0] }
          }
        }
      }
    },

    // merge rows of csv_data having the exact same key
    // and record the number of items within csv_data[i].nb
    csv_merge_wrt_keys (csv_data) {
      // sort items
      csv_data = csv_data.sort((a, b) => a.key.localeCompare(b.key))

      // insert while summing up duplicates
      var new_data = []
      for (var i in csv_data) {
        var item = csv_data[i]
        if (!('nb' in item)) {
          item.nb = 1
        }
        if (i != 0 && new_data[new_data.length - 1].key == item.key) {
          new_data[new_data.length - 1].nb += item.nb
        } else {
          new_data.push(item)
        }
      }
      if (csv_data.columns) { new_data.columns = csv_data.columns }
      if (csv_data.header_map) { new_data.header_map = csv_data.header_map }
      return new_data
    },

    // merge rows of csv_data having the exact same year, brand, type and model,
    // and record the number of items within csv_data[i].nb
    csv_merge_raw_items (csv_data) {
      // create keys
      var ukey = 1000
      for (var i in csv_data) {
        var item = csv_data[i]
        var key = ''
        if (item['year'] != '') {
          key = key.concat(item['year'])
        } else {
          key = Number.toString(ukey)
          ukey += 1
        }
        if (csv_data.header_map.in_brand) { key = key.concat(item[csv_data.header_map.in_brand]) }
        if (csv_data.header_map.in_type)  { key = key.concat(item[csv_data.header_map.in_type]) }
        if (csv_data.header_map.in_model) { key = key.concat(item[csv_data.header_map.in_model]) }
        item['key'] = key
      }

      return this.csv_merge_wrt_keys(csv_data)
    },

    parse_raw_csv (csv_text) {
      var csv_data = d3.csvParse(csv_text)

      this.csv_parse_headers(csv_data)
      // console.log(csv_data['header_map']);
      this.csv_parse_dates(csv_data)
      csv_data = this.csv_merge_raw_items(csv_data)

      for (var i in csv_data) {
        var item = csv_data[i]
        item = this.process_csv_raw_item_regex(item, csv_data['header_map'])
      }

      // sort according to scores
      csv_data = csv_data.sort((a, b) => a.score - b.score)

      return csv_data
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
    }

  }

}
