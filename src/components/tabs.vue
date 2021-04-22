<template>
<div>
  <div class="tabs">
    <ul>
    <li v-for="tab in tabs" :class="{ 'is-active': tab.isActive }" :key="tab.name">
      <a :href="tab.href" @click="selectTab(tab)" :style="tab.buttonStyle">{{ tab.name }}</a>
    </li>
    </ul>
  </div>

  <div class="tabs-details">
    <slot></slot>
  </div>
</div>
</template>

<script>

export default {
  name: 'tabs',

  data() { return {tabs: [] }; },

  created() { this.tabs = this.$children; },
  methods: {
      selectTab(selectedTab) {
          this.tabs.forEach(tab => {
              tab.isActive = (tab.name == selectedTab.name);
          });
      }
  }
}

</script>

<style>
.tabs {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

.tabs a {
  color: #4a4a4a;
  text-decoration: none;

  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}

.tabs a:hover {
  background-color: #ddd;
}

.tabs li {
  display: block;
}

.tabs li.is-active a {
  background-color: #ccc;
  color: black;
}

.tabs ul {
  margin:0;
  padding:0;
  /* workarounds buefy/bulma */
  display: block;
}

.tabs-details {
  padding: 12px 12px;
  border: 1px solid #ccc;
  border-top: none;
}

.tabs-details .tabs a {
  font-size: 15px;
  padding: 7px 12px;
}
</style>
