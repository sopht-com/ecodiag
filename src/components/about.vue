<template>
<div>
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
</template>

<script>
export default {
  name: 'about-ecodiag'
}
</script>
