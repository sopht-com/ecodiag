<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Choisissez une méthode de calcul</p>
      </header>
      <section class="modal-card-body">
        <div class="columns">
          <div class="column block">
            <div class="buttons">
              <b-button expanded label="Par flux" @click="$emit('selected','flux');$emit('close')" />
            </div>
            <div class="box">
              <div class="content">
                <p>Recommendé pour :</p>
                <ul>
                  <li>Bilan annuel d'un parc informatique.</li>
                  <li>Bilan sur un historique d'achat de plusieurs années.</li>
                </ul>
                <p>
                  Données à renseigner :
                </p>
                <ul>
                  <li>Listing des <strong>achats sur la période considérée</strong>.</li>
                  <li class="is-italic has-text-weight-light">Optionnel : durée d'amortissement (défaut = 1 an).</li>
                  <!-- <li></li> -->
                </ul>
                <p class="has-text-warning-dark">Ne permet pas d'estimer la consommation électrique.</p>
              </div>
            </div>
          </div>
          <div class="column block">
            <div class="buttons">
              <b-button expanded label="Par stock" @click="$emit('selected','stock');$emit('close')" />
            </div>
            <div class="box content">
              <p>Recommendé pour :</p>
                <ul>
                  <li>Bilan d'un individu, d'un foyer sur une seule année.</li>
                  <li><strong>S'informer</strong> sur les impacts de son parc, ses équipements.</li>
                </ul>
                <p>
                  Données à renseigner :
                </p>
                <ul>
                  <li>Listing des <strong>équippements en cours</strong>...</li>
                  <li>et une <strong>estimation de leur durée de vie</strong>.</li>
                </ul>
                <p class="has-text-warning-dark">Methode peu fiable car :</p>
                <ol  class="has-text-warning-dark">
                  <li>la durée de vie réel n'est pas connue,</li>
                  <li>difficile de réaliser un inventaire précis et consistant.</li>
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
</form>
</template>

<script>
export default {
  name: 'method-picker',
    
  props: {

  },

  emits: ['selected'],

  // data: function () {
  //   return {
  //     method: undefined
  //   }
  // }
}
</script>