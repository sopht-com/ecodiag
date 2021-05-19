<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Choisissez une méthode de calcul</p>
    </header>
    <section class="modal-card-body">
      <div class="columns">
        <div class="column block">
          <div class="buttons">
            <button class="button is-fullwidth" @click="$emit('selected','flux');$emit('close')">Par liste d'achat (<em>flux</em>)</button>
          </div>
          <div class="box">
            <div class="content">
              <p>Cette méthode compatibilise les impacts liés à la fabrication et transport des équipements achétés sur une année donnée.</p>
              <p>Cette méthode est <strong>simple et précise</strong> (pas possible de <em>tricher</em> !), et permet d'étudier les tendances sur plusieurs années en fournissant un historique des achats.</p>
              <p><strong>Recommendé pour bilan annuel d'un parc informatique</strong>.
              <!-- </li> -->
                <!-- <li>Bilan sur un historique d'achat de plusieurs années.</li> -->
              <!-- </ul> -->
              <!-- <p>
                Données à renseigner :
              </p>
              <ul>
                <li>Listing des <strong>achats sur la période considérée</strong>.</li>
                <li class="is-italic has-text-weight-light">Optionnel : durée d'amortissement (défaut = 1 an).</li>
              </ul> -->
              <p class="has-text-warning-dark">Ne permet pas d'estimer la consommation électrique.</p>
              <p>Optionnellement, il est aussi possible de définir une durée d'amortissement permettant d'étaler les impacts sur plusieurs d'années, et donc de lisser <em>à priori</em> les bilans annuel. Pour une durée d'amortissement <code>A</code>, il faudra alors fournir la liste des achats pour l'année donnée et les <code>A-1</code> années précédentes. Nous remmendons de ne pas utiliser cette fonctionnalité (en gardant <code>A=1</code>) à la faveur d'analyse des tendnances <em>à posteriori</em>.</p>
            </div>
          </div>
        </div>
        <div class="column block">
          <div class="buttons">
            <button class="button is-fullwidth" @click="$emit('selected','stock');$emit('close')">Par liste d'inventaire (<em>stock</em>)</button>
          </div>
          <div class="box content">
            <p>Cette méthode s'appuie sur la liste des <strong>équipements en cours d'utilisation</strong> à une date précise, en divisant les impacts liés à leur fabrication et transport par leur <strong>durées de vie</strong> respectives.</p>
            <p>Cette méthode permet en outre une estimation très grossière de la <strong>consommation électrique</strong> annuelle des équipements déclarés.</p>
            <p>Recommendé pour :</p>
              <ul>
                <li>Bilan d'un individu, d'un petit groupe sur une seule année.</li>
                <li><strong>S'informer</strong> sur les impacts de son parc, ses équipements.</li>
              </ul>
              <!-- <p>
                Données à renseigner :
              </p>
              <ul>
                <li>Listing des <strong>équipements en cours</strong>...</li>
                <li>et une <strong>estimation de leur durée de vie</strong>.</li>
              </ul> -->
              <p class="has-text-warning-dark">Methode peu fiable si :</p>
              <ol class="has-text-warning-dark">
                <li>la durée de vie réelle des items n'est pas connue,</li>
                <li>l'inventaire n'est pas précis et parfaitement consistant avec les durées de vie.</li>
              </ol>
          </div>
        </div>
      </div>
    </section>
    <!-- <footer class="modal-card-foot">
        <b-button
            label="OK"
            @click="$emit('close')" />
    </footer> -->
  </div>
</template>

<script>
export default {
  name: 'method-picker',

  props: {

  },

  emits: ['selected', 'close']

  // data: function () {
  //   return {
  //     method: undefined
  //   }
  // }
}
</script>
