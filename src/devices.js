
// this file provides details information for some devices
// - default power consumption
// - typical lifetime (=duration)
// - typical usage, possible values: 365=always ON, 24=ON 24h per working day (i.e., OFF during the WE and vacation), 9, 8, 7
// - model variants providing specific CO2


// see Referenciel_Ecodiag.ods
var devices = {

  desktop:{
    grey_CO2:           350,
    power_consumption:  0.2,  // kW     (seems to be reasonable regarding DELL's CO2 sheets)
    duration:           4,    // years,
    usage:              365,
    yearly_consumption: 300, /* au pif entre ecodiag PC et ecodiag WS */

    models: {
      basic:                {grey_CO2: 250, yearly_consumption: 189 /* ecodiag*/},
      basic_with_screen:    350,
      ecodiag_avg_PC:       {grey_CO2: 300, yearly_consumption: 189 /* ecodiag */, duration: 4},
      avg_WS:               {grey_CO2: 630 /* avg MacPro & Dell Precision */, yearly_consumption: 770 /* ecodiag */, duration: 5},
      powerful:             {grey_CO2: 500, yearly_consumption: 770},

      optiplex_micro:       {grey_CO2: 210, yearly_consumption:  45 /* DELL */ },
      optiplex_small:       {grey_CO2: 260, yearly_consumption:  90 /* DELL */ },
      optiplex_tower:       {grey_CO2: 280, yearly_consumption: 110 /* DELL */ },

      precision_tower_3xxx: {grey_CO2: 365, yearly_consumption: 150 /* DELL */ },
      precision_tower_5xxx: {grey_CO2: 500, yearly_consumption: 440 /* DELL */ },
      precision_tower_7xxx: {grey_CO2: 700, yearly_consumption: 760 /* DELL */ },

      mac_mini:             270,
      imac_21:              290,
      imac_21_retina:       300,
      imac_27_retina:       450,
      imac_pro:             700,
      mac_pro:              900,
      mac_pro_all_options: 2300,
    }
  },


  // ecodiag: 210
  laptop:{
    grey_CO2:           350,
    power_consumption:  0.025,  // kW
    duration:           4,      // years
    usage:              9,
    yearly_consumption: 48,     // ecodiag, match 0.025 kW * 9h * 220j :)

    models: {
      basic:              300,
      ecodiag_avg_laptop: {grey_CO2: 210, yearly_consumption: 48, duration: 3},
      powerful:           400,

      latitude_3xxx:      300,
      latitude_5xxx:      410,
      latitude_72xx:      355,
      latitude_73xx:      335,
      latitude_74xx:      415,
      precision_5xxx:     345,
      precision_3xxx:     335,
      macbook_air:        190,
      macbook_pro_13:     250,
      macbook_pro_15:     360,
      macbook_pro_16:     360,
    }
  },

  // ecodiag: 350
  screen:{
    grey_CO2:           430,    // based on the average of 9 DELL's 24" monitors (24" monitors are likely the most common)
    power_consumption:  0.035,  // kW (measured on AOC Q3277PQU)
    duration:           5,      // years, ecodiag: 3
    usage:              365,
    yearly_consumption: 70,     // ecodiag, match 0.035 kW * 9h * 220j :)
    models: {
      screen_upto23 : {grey_CO2: 350}, // average on DELL's data
      screen_24to31 : {grey_CO2: 430}, // average on DELL's data
      screen_32toinf: {grey_CO2: 590, yearly_consumption: 110}, // average on DELL's data
    }
  },

  videoprojector: {
    // https://www.bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=vid%C3%A9o+projecteur
    grey_CO2:           94,   // TODO : 75% d'incertitude !!
    power_consumption:  0.3,  // source : recherche rapide de quelques modèles standards d'Epson
    duration:           7,    // pif
    yearly_consumption: 120   /* = 2h * 200j * 0.3kW */, // ecodiag 1752 pour 500h/an => ça ne colle pas ! y'a un bug !
    usage:              3,    // 3h par jour ouvré
    models: {
      //                                                                                                          kWh  =  kW  *h*days
      projector_portable: {grey_CO2:  94 /* ADEME */, duration:  7, power_consumption: 0.260, yearly_consumption: 104 /* 0.260*2*200 */},
      projector_room:     {grey_CO2: 150 /* pif */  , duration: 10, power_consumption: 0.310, yearly_consumption: 155 /* 0.310*2*250 */},
      projector_large:    {grey_CO2: 200 /* pif */  , duration: 10, power_consumption: 0.700, yearly_consumption: 280 /* 0.700*2*200 */},
    }
  },

  // TV: {
  //   grey_CO2:             400,  // [340:500], http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9vision
  //   yearly_consumption:   110,  // 100W * 3h * 365days
  //   power_consumption:    0.1,  // TODO
  //   duration:             7,    // TODO
  //   usage:                3,
  // },

  // ecodiag: 80
  pad: {
    grey_CO2:           150,
    power_consumption:  0, // TODO
    duration:           2,  // ecodiag
    yearly_consumption: 5,  // ecodiag
  },

  // ecodiag: 63
  // http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9phone
  // - [16:40] +/- 50%
  smartphone: {
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
    grey_CO2: 100,        // TODO  [90:200] http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=imprimante
    power_consumption: 0, // TODO
    duration:          3, // TODO
    yearly_consumption: 71, /* ecodiag, match avg lexmark */
    models: {
      laser_lt_40kg:    {grey_CO2:  130 /* avg lexmark */ + 300 /* toners CHECK */, yearly_consumption: 71 /* ecodiag, match avg lexmark */, duration: 5},
      office_40_99kg:   {grey_CO2:  660 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 150 /* lexmark */, duration: 5},
      office_ge_100kg:  {grey_CO2: 1500 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 200 /* TODO */, duration: 5},
    }
  },

  ipphone: {
    grey_CO2:           17, // ecodiag
    power_consumption:  40/(24*365), // to match yearly_consumption
    duration:           10, // pif
    yearly_consumption: 40, // ecodiag
    usage:             365,
  },

  keyboard: {
    grey_CO2:           24, // ecodiag => this seems way too high
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  mouse: {
    grey_CO2:            5, // ecodiag
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  wifihub: {
    grey_CO2:           10, // ecodiag
    power_consumption:   70/(24*365), // to match yearly_consumption
    duration:            6,
    yearly_consumption: 70, // ecodiag
    usage:             365
  },

  server: {
    grey_CO2: 1300,           // ecodiag
    power_consumption: 0,     // TODO
    duration:          5,     // ecodiag
    yearly_consumption: 850,  // ecodiag

    models: {
      computingserver: {grey_CO2: 1300 /* ecodiag */, yearly_consumption: 1600 /* ecodiag */, duration: 5 /* ecodiag */}
    }
  },

};