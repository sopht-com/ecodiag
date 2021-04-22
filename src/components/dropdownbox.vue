
<template>
  <div class="section">
    <div class="title" v-on:click="toggle">
      <ml :en="title_en">{{ title }}</ml>
      <span class="toggleIcon" id="toggleIcon">{{toggleIcon}}</span>
    </div>
    <transition name="smooth" v-on:after-enter="after_enter" v-on:before-enter="before_enter" v-on:before-leave="before_leave">
      <div class="body" v-show="showSection" ref="body" >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'dropdownbox',
  
  props: {
    title: String,
    title_en: String,
    show:{type:Boolean,default: false}
  },

  methods: {

    toggle : function() {
      this.showSection = !this.showSection
      this.toggleIcon = this.showSection ? '\u25B2' : '\u2026' //25BC, 25B6, 2212
    },

    before_enter: function() {
      var body = this.$refs['body']
      body.style.display = 'block'
      const height = body.scrollHeight
      body.style.display = 'none'
      body.style.height = height + 'px'
    },

    after_enter: function() {
      // to enable auto resize when adding elements
      this.$refs['body'].style.height='auto'
    },

    before_leave: function() {
      var body = this.$refs['body']
      body.style.height = body.scrollHeight + 'px'
      // force recomputation of initial height for the transition
      hackHeight = window.getComputedStyle(body).height
      body.style.height = 0
    }

  },
  mounted() {
    if(this.show) {
      this.toggle()
    }
  },
  data() {
    return {
      showSection: false,
      toggleIcon: '\u2026',
      hackHeight:0
    }
  }
}

</script>

<style scoped>
.section .title {
  background-color: #777;
  color: white;
  cursor: pointer;
  padding: 0.5em 1em;
  border: none;
  text-align: left;
  outline: none;
  font-size: 120%;
}

.section .title:hover {
  background-color: #555;
}

.section .body {
  padding: 0 1em;
  display: block;
  overflow: hidden;
  background-color: #f1f1f1;
  height:0;
}

.toggleIcon {
  font-size: 90%;
  color: white;
  float: right;
  margin-left: 1em;
  margin-right: 0;
}

.smooth-enter-active, .smooth-leave-active{
  transition: height .3s;
}
</style>