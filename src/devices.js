
/* eslint-disable */

// this file provides details information for some devices
// - default power consumption
// - typical lifetime (=duration)
// - typical usage, possible values: 365=always ON, 24=ON 24h per working day (i.e., OFF during the WE and vacation), 9, 8, 7
// - model variants providing specific CO2


function hypot(vals) {
  return Math.sqrt(vals.reduce((r,v)=>r+v*v, 0));
}

// see Referenciel_Ecodiag.ods
export const devices = {

  desktop:{
    label_fr:           "PC fixe sans écran",
    label_en:           "Desktop",
    regex:              /(pc.*fix|desktop|poste.*fix|ordinateur|computer|fixe|tour|tower|unite centrale)/i,
    grey_CO2:           {mean:350,std:hypot([0.3,0.72])},
    power_consumption:  0.2,  // kW     (seems to be reasonable regarding DELL's CO2 sheets)
    duration:           4,    // years,
    usage:              365,
    yearly_consumption: 250, /* moyenne pondérée entre ecodiag avg PC et Workstation */

    models: {
      // basic:                {grey_CO2: {mean:250,std:hypot([0.3,0.12 /*semble faible*/])}, yearly_consumption: 189 /* ecodiag*/},
      // basic_with_screen:    350,
      
      avg_WS:               {
        label_fr: 'Station de travail (moy.)',
        label_en: 'Workstation (average)',
        regex:    /station/i,
        grey_CO2: {mean:600,std:hypot([0.3,0.27])} /* avg MacPro & Dell Precision */, yearly_consumption: 770 /* ecodiag */, duration: 5},
      // powerful:             {grey_CO2: 500, yearly_consumption: 770},

      optiplex_micro:       {label: 'Optiplex Micro', regex: /optiplex.*micro/i,grey_CO2: {mean:174,std:hypot([0.3,0.07])}, yearly_consumption:  45 /* DELL */ },
      optiplex_small:       {label: 'Optiplex Small', regex: /optiplex.*small/i,grey_CO2: {mean:240,std:hypot([0.3,0.07])}, yearly_consumption:  90 /* DELL */ },
      optiplex_tower:       {label: 'Optiplex Tower', regex: /optiplex.*(tower|tour)/i,grey_CO2: {mean:260,std:hypot([0.3,0.12])}, yearly_consumption: 110 /* DELL */ },

      precision_tower_3xxx: {label: 'Precision Tower 3xxx', regex: /pr.cision.*3\d{3}/i,grey_CO2: {mean:322,std:hypot([0.3,0.15])}, yearly_consumption: 150 /* DELL */ },
      precision_tower_5xxx: {label: 'Precision Tower 5xxx', regex: /pr.cision.*5\d{3}/i,grey_CO2: {mean:475,std:hypot([0.3,0.03])}, yearly_consumption: 440 /* DELL */ },
      precision_tower_7xxx: {label: 'Precision Tower 7xxx', regex: /pr.cision.*7\d{3}/i,grey_CO2: {mean:646,std:hypot([0.3,0.06])}, yearly_consumption: 760 /* DELL */ },

      mac_mini:             {label: 'Mac mini', regex: /mac.*mini/i,grey_CO2: 270},
      mac_pro:              {label: 'Mac pro', regex: /mac(?!.*book).*pro/i,grey_CO2: 900},
      // mac_pro_all_options: 2300,

      // last entry to play the role of fallback
      ecodiag_avg_PC:       {
        label_fr: 'PC fixe (moy.)',
        label_en: 'Tower (average)',
        regex:    /(optiplex|imac|pr.cision t|elitedesk)/i,
        grey_CO2: {mean:300,std:hypot([0.3,0.2])}, yearly_consumption: 189 /* ecodiag */, duration: 4},
    }
  },

  allinone: {
    label_fr:           "PC fixe tout-en-un",
    label_en:           "All-in-One",
    regex:              /(all.*in.*one|tout.*en.*un)/i,
    grey_CO2:           {mean:352,std:hypot([0.3,0.51])},
    power_consumption:  0.2,
    duration:           4,
    usage:              365,
    yearly_consumption: 78,

    models: {
      optiplex_allinone_3xxx: {label: 'Optiplex All-in-One 3xxx', regex: /optiplex.*((all.*in.*one|aio).*3\d{3}|3\d{3}.*(all.*in.*one|aio))/i, grey_CO2: {mean:241,std:hypot([0.3,0.19])}, yearly_consumption: 62 },
      optiplex_allinone_5xxx: {label: 'Optiplex All-in-One 5xxx', regex: /optiplex.*((all.*in.*one|aio).*5\d{3}|5\d{3}.*(all.*in.*one|aio))/i, grey_CO2: {mean:318,std:hypot([0.3,0.22])}, yearly_consumption: 75 },
      optiplex_allinone_7xxx: {label: 'Optiplex All-in-One 7xxx', regex: /optiplex.*((all.*in.*one|aio).*7\d{3}|7\d{3}.*(all.*in.*one|aio))/i, grey_CO2: {mean:382,std:hypot([0.3,0.32])}, yearly_consumption: 90 },

      imac_21:              {label: 'iMac 21"', regex: /imac.*21/i,grey_CO2: 290},
      imac_21_retina:       {label: 'iMac 21" retina', regex: /imac.*21/i,grey_CO2: 300},
      imac_27_retina:       {label: 'iMac 27" retina', regex: /imac.*27/i,grey_CO2: 450},
      imac_pro:             {label: 'iMac pro', regex: /imac.*pro/i,grey_CO2: 700},
      mac_pro:              {label: 'Mac pro', regex: /mac(?!.*book).*pro/i,grey_CO2: 900}
    }
  },

  // old value: 210
  laptop:{
    label_fr:           "PC portable",
    label_en:           "Laptop",
    regex:              /(laptop|portable|notebook|ordinateur)/i,
    power_consumption:  0.025,  // kW
    duration:           3,      // years
    usage:              9,
    grey_CO2:           {mean:260,std:hypot([0.2,0.56])},
    yearly_consumption: 48,     // ecodiag, match 0.025 kW * 9h * 220j :)

    models: {

      avg_laptop_13: {
        label_fr:           "Moyenne 13\"",
        label_en:           "Average 13\"",
        regex: /13(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: {mean:250,std:hypot([0.2 /* arbitrary */, 0.44])}},

      avg_laptop_15: {
        label_fr:           "Moyenne 14-15\"",
        label_en:           "Average 14-15\"",
        regex: /15(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: {mean:294,std:hypot([0.2 /* arbitrary */, 0.37])}},

      avg_laptop_17: {
        label_fr:           "Moyenne 17\"",
        label_en:           "Average 17\"",
        regex: /17(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: {mean:365,std:hypot([0.2 /* arbitrary */, 0.18 /* ! low number of samples (3) */])}},

      
      latitude_3xxx:     {
        label: "Latitude 3xxx",
        regex: /latitude.*3\d{3}/i,
        grey_CO2: {mean:220,std:hypot([0.2 /* arbitrary */, 0.13])}},

      latitude_5xxx:     {
        label: "Latitude 5xxx",
        regex: /latitude.*5\d{3}/i,
        grey_CO2: {mean:300,std:hypot([0.2 /* arbitrary */, 0.21])}},

      latitude_7xxx:     {
        label: "Latitude 7xxx",
        regex: /latitude.*7\d{3}/i,
        grey_CO2: {mean:264,std:hypot([0.2 /* arbitrary */, 0.33])}},

      // latitude_72xx:      355,
      // latitude_73xx:      335,
      // latitude_74xx:      415,

      precision_3xxx:     {
        label: "Precision 3xxx",
        regex: /pr.cision(?!.*tower.*).*3\d{3}/i,
        grey_CO2: {mean:266,std:hypot([0.2 /* arbitrary */, 0.06])}},
      
      precision_5xxx:     {
        label: "Precision 5xxx",
        regex: /pr.cision(?!.*tower.*).*5\d{3}/i,
        grey_CO2: {mean:280,std:hypot([0.2 /* arbitrary */, 0.03])}},

      precision_7xxx:     {
        label: "Precision 7xxx",
        regex: /pr.cision(?!.*tower.*).*7\d{3}/i,
        grey_CO2: {mean:304,std:hypot([0.2 /* arbitrary */, 0.09])}},
        

      macbook_air:        {
        label: "MacBook air",
        regex: /macbook.*air/i,
        grey_CO2: {mean:250,std:hypot([0.2 /* arbitrary */, 0.47])}},
      macbook_air_preretina:        {
        label: "MacBook air pre-retina",
        regex: /macbook.*air/i,
        grey_CO2: {mean:310,std:hypot([0.2 /* arbitrary */, 0.08])}},
      macbook_air_retina:        {
        label: "MacBook air retina",
        regex: /macbook.*air.*retina/i,
        grey_CO2: {mean:176,std:hypot([0.2 /* arbitrary */, 0.11])}},
      
      macbook_pro_13:     {
        label: "MacBook pro 13\"",
        regex: /macbook.*pro.*13/i,
        grey_CO2: {mean:256,std:hypot([0.2 /* arbitrary */, 0.34])}},
      
      macbook_pro_15:   {
        label: "MacBook pro 15\"",
        regex: /macbook.*pro.*(15|16)/i,
        grey_CO2: {mean:330,std:hypot([0.2 /* arbitrary */, 0.18])}},
      
      // macbook_pro_16:  {
      //   label: "MacBook pro 16\"",
      //   grey_CO2: {mean:330,std:hypot([0.2 /* arbitrary */, 0.18])}},

      // last entry to play the role of fallback
      default: {
        label_fr: "Défaut",
        label_en: "Default",
        regex:    /(latitude|(z.*|elite)book|mac\s?book|thinkpad)/i,
        grey_CO2: {mean:260,std:hypot([0.2,0.56])}, yearly_consumption: 48, lifetime: 3},
    }
  },

  // old value: 350
  screen:{
    label_fr:           "Écran",
    label_en:           "Screen",
    regex: /(.cran|screen)/i,
    grey_CO2:           430,    // based on the average of 9 DELL's 24" monitors (24" monitors are likely the most common)
    power_consumption:  0.035,  // kW (measured on AOC Q3277PQU)
    duration:           5,      // years, ecodiag: 3
    usage:              365,
    yearly_consumption: 70,     // ecodiag, match 0.035 kW * 9h * 220j :)
    models: {
      screen_upto23 : {
        label_fr: 'jusqu\'à 23"',
        label_en: 'up to 23"',
        regex: /(18|19|20|21|22|23)(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: 350}, // average on DELL's data
      screen_24to31 : {
        label:    '24"-31"',
        regex: /(24|25|26|27|28|29|30|31)(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: 430}, // average on DELL's data
      screen_32toinf: {
        label_fr:'32" et plus',
        label_en:'32" and larger',
        regex: /(32|33|34|35|36)(\.?\d*\"|.*pouce|.*inch)/i,
        grey_CO2: 590, yearly_consumption: 110}, // average on DELL's data
    }
  },

  videoprojector: {
    label_fr: 'Vidéo projecteur',
    label_en: 'Video projector',
    // https://www.bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=vid%C3%A9o+projecteur
    grey_CO2:           94,   // TODO : 75% d'incertitude !!
    power_consumption:  0.3,  // source : recherche rapide de quelques modèles standards d'Epson
    duration:           7,    // arbitraire
    yearly_consumption: 120   /* = 2h * 200j * 0.3kW */, // ecodiag 1752 pour 500h/an => ça ne colle pas ! y'a un bug !
    usage:              3,    // 3h par jour ouvré
    
    regex:              /(videoprojector|videoprojecteur)/i,

    models: {
      //                                                                                                          kWh  =  kW  *h*days
      projector_portable: {
        label_fr: 'Transportable',
        label_en: 'Portable',
        grey_CO2:  94 /* ADEME */, duration:  7, power_consumption: 0.260, yearly_consumption: 104 /* 0.260*2*200 */},
      projector_room:     {
        label_fr: 'Pour salle',
        label_en: 'For meeting/class room',
        grey_CO2: 150 /* heuristic conservative sur le poids */  , duration: 10, power_consumption: 0.310, yearly_consumption: 155 /* 0.310*2*250 */},
      projector_large:    {
        label_fr: 'Pour amphi',
        label_en: 'For conference room',
        grey_CO2: 200 /* heuristic conservative sur le poids */  , duration: 10, power_consumption: 0.700, yearly_consumption: 280 /* 0.700*2*200 */},
    }
  },

  // TV: {
  //   grey_CO2:             400,  // [340:500], http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9vision
  //   yearly_consumption:   110,  // 100W * 3h * 365days
  //   power_consumption:    0.1,  // TODO
  //   duration:             7,    // TODO
  //   usage:                3,
  // },

  // old value: 80
  pad: {
    label_fr:           'Tablette',
    label_en:           'Pad',
    regex:              /(tablet|pad|pda)/i,
    grey_CO2:           150,
    power_consumption:  0, // TODO
    duration:           2,  // ecodiag
    yearly_consumption: 5,  // ecodiag
  },

  // old value: 63
  // http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9phone
  // - [16:40] +/- 50%
  smartphone: {
    label:              'Smartphone',
    regex:              /(smartphone|t.l.phone.*portable|mobile)/i,
    grey_CO2:           63,
    power_consumption:  0,    // TODO
    duration:           1.5,  // TODO
    yearly_consumption: 5,    // ecodiag
  },

  // console: {
  //   power_consumption: 0, // TODO
  //   duration:          5, // TODO
  // },



  printer: {
    label_fr: 'Imprimante',
    label_en: 'Printer',
    regex:    /(imprimante|printer)/i,
    grey_CO2: 200 /* average laser */ + 300 /* toners */,        // TODO  [90:200] http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=imprimante
    power_consumption: 0, // TODO
    duration:          3, // TODO
    yearly_consumption: 71, /* ecodiag, match avg lexmark */
    models: {
      laser_lt_40kg:    {
        label_fr: 'Laser à poser (<40kg)',
        label_en: 'Laser (<40kg)',
        grey_CO2:  130 /* avg lexmark */ + 300 /* toners CHECK */, yearly_consumption: 71 /* ecodiag, match avg lexmark */, duration: 5},
      office_40_99kg:   {
        label: 'Laser A3 (40-99kg)',
        grey_CO2:  660 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 150 /* lexmark */, duration: 5},
      office_ge_100kg:  {
        label: 'Laser A3 (>100kg)',
        grey_CO2: 1500 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 200 /* TODO */, duration: 5},
    }
  },

  ipphone: {
    label_fr:           'Téléphone IP',
    label_en:           'IP phone',
    grey_CO2:           17, // ecodiag
    power_consumption:  40/(24*365), // to match yearly_consumption
    duration:           10, // arbitraire
    yearly_consumption: 40, // ecodiag
    usage:             365,
  },

  keyboard: {
    label_fr:           'Clavier',
    label_en:           'Keyboard',
    regex:              /(keyboard|clavier).*(azerty|qwerty)/i,
    grey_CO2:           24, // ecodiag => this seems way too high
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  mouse: {
    label_fr:           'Souris',
    label_en:           'Mouse',
    grey_CO2:            5, // ecodiag
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  wifihub: {
    label_fr:           'Borne wifi',
    label_en:           'Wifi hub',
    grey_CO2:           10, // ecodiag, https://www.ece.nus.edu.sg/stfpage/bsikdar/papers/tce_bs_12.pdf
    power_consumption:   70/(24*365), // to match yearly_consumption
    duration:            6,
    yearly_consumption: 70, // ecodiag
    usage:             365
  },

  server: {
    label_fr:           'Serveur',
    label_en:           'Server',
    regex:              /(server|serveur)/i,
    grey_CO2:           1300,   // ecodiag
    power_consumption:  0,      // TODO
    duration:           5,      // ecodiag
    yearly_consumption: 850,    // ecodiag

    models: {
      default: {
        label_fr: 'Défaut',
        label_en: 'Default',
        regex: /(poweredge)/i
      },
      computingserver: {
        label_fr: 'Noeud de calcul',
        label_en: 'Computing node',
        regex:    /(calcul|comput.*node)/i,
        grey_CO2: 1300 /* ecodiag */, yearly_consumption: 1600 /* ecodiag */, duration: 5 /* ecodiag */}
    }
  },

  harddrive: {
    label_fr:           'Disque dur',
    label_en:           'Harddrive',
    regex:              /disque dur (interne|externe)/i,
    grey_CO2:           {mean:10,std:0.1},
                        // based on DEEL/HP sheets for HDD
                        // the footprint of SSD is much higher
    duration:            4,
    yearly_consumption:  0,
  },

  gpu: {
    label_fr:           'GPU puissant',
    label_en:           'Powefull GPU',
    regex:              /carte graphique/i,
    grey_CO2:           {mean:80,std:hypot([0.3,0.5])},
                            // It highly depends on the GPU, but assuming only powerful GPU's are counted,
                            // and provided that on average the footprint of a motherboard is about 113 kgCO2e
                            // this choice seems reasonable.
                            // Uncertainties:
                            //  - 30% for the LCA
                            //  - 50% for the variation across GPUs
    duration:            4,
    yearly_consumption:  0,
    models: {
      default: {
        label_fr: 'Défaut',
        regex: /(carte graphique|\Wgtx\W|\Wrtx\W|\Wquadro\W|\Wtitan\W|\Wgeforce\W|\Wgpu\W)/i
      }
    }
  },

};