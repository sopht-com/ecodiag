const messages = {
  en: {
    words:{
      year: 'year',
      per_year: 'per year',
      lifetime: 'lifetime',
      actual: 'actual',
      objective: 'objective',
      fabrication: 'fabrication',
      model: 'model',
      quantity: 'quantity',
      use: 'use',
      coal: 'coal',
      solar_panel: 'solar panel',
      unit: 'unit',
      stdev: 'standard deviation',
    },
    title:{
      device_list: 'Devices',
      data: 'Data',
      about: 'About',
    },
    labels: {
      fabrication:"fabrication nl and transport nl (actual vs objective)",
      fabrication_actual:"fabrication nl and transport nl (actual)",
      fabrication_objective:"fabrication nl and transport nl (objective)",
      fabrication_uncertainty:"fabrication nl and transport nl (mean + nl uncertainty nl bounds)",
      use:"electricity nl consumption nl (use)",
      'default':'default',
      'other':'other',
    },
    message: {
      lifetime_saving: "Potential emission saving by increasing the lifetime of my devices: <span class=\"value\">{amount}</span> kg.CO2e per year."
    }
  },
  fr: {
    words:{
      year: 'an',
      lifetime: 'durée de vie',
      actual: 'actuel',
      coal: 'charbon',
      objective: 'objectif',
      fabrication: 'fabrication',
      model: 'modèle',
      quantity: 'quantité',
      use: 'usage',
      solar_panel: 'panneau photovoltaïque',
      unit: 'unité',
      stdev: 'écart type',
    },
    title:{
      device_list: 'Équipement',
      data: 'Données',
      about: 'À propos',
    },
    labels: {
      fabrication:"fabrication nl et transport nl (actuel vs objectif)",
      fabrication_actual:"fabrication nl et transport nl (actuel)",
      fabrication_objective:"fabrication nl et transport nl (objectif)",
      fabrication_uncertainty:"fabrication nl et transport nl (moyenne + nl bornes nl d'incertitudes)",
      use:"consommation nl électrique nl (usage)",
      'default':'défaut',
      'other':'autre',
    },
    message: {
      lifetime_saving: "Économies réalisables par l'augmentation de la durée de vie de mes équipements : <span class=\"value\">{amount}</span> kg.CO2e par an."
    }
  }
}

function add_label(k,d) {
  if(d.label_en)
    messages.en.labels[k] = d.label_en;
  else if(d.label)
    messages.en.labels[k] = d.label;
  
  if(d.label_fr)
    messages.fr.labels[k] = d.label_fr;
  else if(d.label)
    messages.fr.labels[k] = d.label;
}

// populate with labels from devices.js 
for(var t in devices) {
  var d = devices[t];
  add_label(t,d);
  if(d.models) {
    for(var m in d.models ) {
      add_label(m,d.models[m]);
    }
  }
}
