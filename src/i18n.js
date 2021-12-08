export default {
  en: {
    words: {
      year: 'year',
      years: 'years',
      per_year: 'per year',
      lifetime: 'lifetime',
      actual: 'actual',
      objective: 'objective',
      fabrication: 'production',
      model: 'model',
      type: 'type',
      quantity: 'quantity',
      use: 'use',
      coal: 'coal',
      solar_panel: 'solar panel',
      unit: 'unit',
      stdev: 'standard deviation',
      date: 'date',
      score: 'score',
      purchase_year: 'year',
      factor: 'factor',
      lifestime_: 'lifetime',
      calculation: 'calculation'
    },
    title: {
      device_list: 'Devices',
      data: 'Options',
      about: 'About',
      csv_import: 'CSV import',
      help: 'Help'
    },
    labels: {
      fabrication: 'production nl and transport',
      fabrication_vs_objective: 'production nl and transport nl (actual vs objective)',
      fabrication_actual: 'production nl and transport nl (actual)',
      fabrication_objective: 'production nl and transport nl (objective)',
      fabrication_uncertainty: 'production nl and transport nl (mean + nl uncertainty nl bounds)',
      use: 'electricity nl consumption nl (use)',
      'default': 'default',
      'default_model': 'Default model',
      'other': 'Other',
      validity: 'Validity',
      damping_duration: 'damping duration',
      lifetime_of_el_i: 'lifetime of element i in years',
      factor_of_el_i: 'emission factor of element i in kgCO2e for \'production + transport + packaging + end-of-life\'',
      sum_over_rows: 'sum over the set of \'valid\' rows'
    },
    methods: {
      'flux': 'flux',
      'stock': 'stock',
      'undefined': 'undefined'
    },
    message: {
      lifetime_saving: 'Potential emission saving by increasing the lifetime of my devices: <span class=\'value\'>{amount}</span> kg.CO2e per year.'
    }
  },
  fr: {
    words: {
      year: 'an',
      years: 'années',
      lifetime: 'durée de vie',
      actual: 'actuel',
      coal: 'charbon',
      objective: 'objectif',
      fabrication: 'fabrication',
      model: 'modèle',
      type: 'type',
      brand: 'marque',
      quantity: 'quantité',
      use: 'usage',
      solar_panel: 'panneau photovoltaïque',
      unit: 'unité',
      stdev: 'écart type',
      date: 'date',
      score: 'score',
      purchase_year: 'année',
      factor: 'facteur',
      lifestime_: 'durée_de_vie',
      calculation: 'calcul'
    },
    title: {
      device_list: 'Équipement',
      data: 'Options',
      about: 'À propos',
      csv_import: 'Importer CSV',
      help: 'Aide'
    },
    labels: {
      fabrication: 'Fabrication nl et transport',
      fabrication_vs_objective: 'Fabrication nl et transport nl (actuel vs objectif)',
      fabrication_actual: 'Fabrication nl et transport nl (actuel)',
      fabrication_objective: 'Fabrication nl et transport nl (objectif)',
      fabrication_uncertainty: 'Fabrication nl et transport nl (moyenne + nl bornes nl d\'incertitudes)',
      use: 'Consommation nl électrique nl (usage)',
      'default': 'Défaut',
      'default_model': 'Modèle par défaut',
      'other': 'Autre',
      validity: 'Validité',
      damping_duration: 'durée d\'amortissement',
      lifetime_of_el_i: 'durée de vie de l\'élément i en années',
      factor_of_el_i: 'facteur d\'émission de l\'élément i en kgCO2e pour \'fabrication + transport + packaging + fin-de-vie\'',
      sum_over_rows: 'somme sur l\'ensemble des lignes \'valides\''
    },
    methods: {
      'flux': 'par liste d\'achat (flux)',
      'stock': 'par liste d\'inventaire (stock)',
      'undefined': 'undefined'
    },
    message: {
      lifetime_saving: 'Économies réalisables par l\'augmentation de la durée de vie de mes équipements : <span class=\'value\'>{amount}</span> kgCO2e par an.'
    }
  }
}
