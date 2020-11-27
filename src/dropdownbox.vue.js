
Vue.component('dropdownbox', {
  
  props: {
    title: String,
    title_en: String,
    show:{type:Boolean,default: false}
  },

  template: /*html*/`
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
  </div>`,

  methods: {

    toggle : function() {
      this.showSection = !this.showSection
      this.toggleIcon = this.showSection ? '\u25B2' : '\u2026' //25BC, 25B6, 2212
    },

    before_enter: function() {
      var body = this.$refs['body'];
      body.style.display = 'block';
      const height = body.scrollHeight;
      body.style.display = 'none';
      body.style.height = height + 'px'
    },

    after_enter: function() {
      // to enable auto resize when adding elements
      this.$refs['body'].style.height='auto'
    },

    before_leave: function() {
      var body = this.$refs['body'];
      body.style.height = body.scrollHeight + 'px';
      // force recomputation of initial height for the transition
      hackHeight = window.getComputedStyle(body).height;
      body.style.height = 0
    }

  },
  mounted() {
    if(this.show) {
      this.toggle();
    }
  },
  data() {
    return {
      showSection: false,
      toggleIcon: '\u2026',
      hackHeight:0
    }
  }
})

