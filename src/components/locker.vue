
<template>
<div>
  <input :id="locker_id" type="checkbox" class="locker" v-model="unlocked" @change="nested_input.disabled = !unlocked; if(onchange) onchange(unlocked);"/>
  <label :for="locker_id"></label>
  <span ref="div_input">
    <slot></slot>
  </span>
</div>
</template>

<script>
export default {
  name: 'locker',
  props: ['onchange'],

  mounted () {
    this.locker_id = 'locker_' + this._uid
    this.nested_input = this.$refs.div_input.childNodes[0]
    this.unlocked = !this.nested_input.disabled
  },

  data () {
    return {
      unlocked: null,
      locker_id: null,
      nested_input: null
    }
  }

}
</script>

<style scoped>

input[type=checkbox].locker {
  display: none;
}

input[type=checkbox].locker + label
{
  background: url("../icons/lock_icon.png") left bottom no-repeat;
  background-size: 11px 14px;

  height: 15px;
  width: 11px;
  margin-left: -4px;
  display:inline-block;
  padding: 0px;
  margin-top:  0px;
  margin-right:6px;
}

input[type=checkbox].locker:checked + label
{
  background: url("../icons/unlock_icon.png") left bottom no-repeat;
  background-size: 11px 14px;
}

</style>
