Vue.component('locked',{
  props:['onchange'],
  template: /*html*/`
    <div>
      <input :id="locker_id" type="checkbox" class="locker" v-model="unlocked" @change="nested_input.disabled = !unlocked; if(onchange) onchange(unlocked);"/>
      <label :for="locker_id"></label>
      <span ref="div_input">
        <slot></slot>
      </span>
    </div>`,

  mounted() {
    this.locker_id = "locker_"+this._uid;
    this.nested_input = this.$refs.div_input.childNodes[0];
    this.unlocked = !this.nested_input.disabled;
  },

  data() {
    return {
      unlocked: null,
      locker_id: null,
      nested_input: null
    };
  }

})