<template>
<div>
<transition name="tooltip">
  <div ref="tooltip" v-show="tooltip.show" class="tooltip" :style="tooltip.style" v-html="tooltip.msg"></div>
</transition>
<svg
  :height='height'
  :width='width'
>
  <!--
  <marker id="err" viewBox="-1 -1 1 2"
    refX="0" refY="0" 
    markerUnits="strokeWidth"
    markerWidth="2" markerHeight="12"
    orient="auto">
    <line x1="0" x2="0" y1="-1" y2="1" stroke="black" />
  </marker>
  -->

  <g :transform="translate(margin.left,margin.top)">
    <g class="y axis" >
    </g>
    <g class="x axis" :transform="translate(0,gridHeight)">
    </g>
    <g class="category" v-for="(cat,k1) in active_data" :key="k1">
    
      <g class="subcategory" v-for="(sub,k2) in cat.data" :key="k2">
          <rect v-for="(item, i) in sub"
                :x="x(item.sum-item.val)"
                :y="compute_y(cat,sub,k2) "
                :width="x(item.sum)-x(item.sum-item.val)"
                :height="compute_height(cat,sub)"
                :fill="type2color(item.key, {dim: sub.dim ? sub.dim : 0, contrast: 1, group_name:cat.key})"
                stroke="white" stroke-width="0"
                :id="'rect_'+k1+10*k2+100*i"
                :key="k1+10*k2+100*i"
                @mouseover="tooltip.show=true;tooltip.msg=item.label + '<br>' + Math.round(item.val)"
                @mouseout="tooltip.show=false"
                @mousemove="tooltip.style = {left:($event.pageX+2)+'px', top:($event.pageY+5)+'px'}"
          />
          <g v-if="sub.uncertainty" class="errorbar">
            <circle :cx="x(sub.uncertainty.mean)" :cy="compute_y(cat,sub,k2) + compute_height(cat,sub)/2" r="4" />
            <!-- <line :x1="x(sub.uncertainty.inf)" :x2="x(sub.uncertainty.sup)"
                  :y1="compute_y(cat,sub,k2) + compute_height(cat,sub)/2"
                  :y2="compute_y(cat,sub,k2) + compute_height(cat,sub)/2"
                  marker-start="url(#err)"
                  marker-end="url(#err)" /> -->
            <!-- here we use a rect instead of a line because line's x1,x2 properties are not animatable through css transitions-->
            <rect :x="x(sub.uncertainty.inf)"
                  :y="compute_y(cat,sub,k2) + compute_height(cat,sub)/2 - 1"
                  height="2px"
                  :width="x(sub.uncertainty.sup) - x(sub.uncertainty.inf)"
                  />
            <rect :x="x(sub.uncertainty.inf)"
                  :y="compute_y(cat,sub,k2) + compute_height(cat,sub)/2 - 4"
                  height="8px"
                  width="2px"
                  />
            <rect :x="x(sub.uncertainty.sup)"
                  :y="compute_y(cat,sub,k2) + compute_height(cat,sub)/2 - 4"
                  height="8px"
                  width="2px"
                  />
          </g>
      </g>
    </g>
  </g>
</svg>
</div>
</template>

<script>

import "d3-transition"
import * as d3axis from "d3-axis"
import * as d3select from "d3-selection"
import * as d3scale from "d3-scale"
import { d3_insert_line_breaks, pSBC } from "../d3-utils"
import { device_utils } from '../device_utils'

export default {
  name: 'chart',
  
  props: {
    'plotdata':Array,
    'height':{type: Number, default:150},
    'width':{type: Number, default:700},
  },

  mixins: [device_utils],

  methods: {

    compute_y(cat,sub,k) {
      return this.y(cat.label) + this.y.bandwidth()*(sub.widthPercent?sub.offsetPercent:k/cat.data.length);
    },
    compute_height(cat,sub) {
      return this.y.bandwidth()*(sub.widthPercent?sub.widthPercent:1.0/cat.data.length)
    },

    // a simple hack to enable :transform="translate(...)" within the template
    translate(x,y) {
      return 'translate('+x+','+y+')'
    },

    // add axis through d3
    setup_axis() {
      var xaxis = d3axis.axisBottom(this.x)
            .ticks(5)
            .tickSize(-(this.gridHeight) , 0, 0)
      d3select.selectAll(".x").transition().duration(500).call(xaxis)
      
      var yaxis = d3axis.axisLeft(this.y);
      d3select.selectAll("g.y.axis").call(yaxis)

      d3select.selectAll('g.y.axis g text').each(d3_insert_line_breaks)
    },

    type2color(t,opt) {

      var energy_color = 'rgb(0,102,204)';
      var contrast_factor = ((!opt) || opt.contrast==undefined) ? 0.5 : opt.contrast
      var grey_color = 'rgb(128,128,128)';

      var color;

      if(opt.group_name=='grey_multi') {
        color = {
          'desktop':    pSBC( 0  *contrast_factor, 'rgb(102, 153, 0)',false,false),
          'screen':     pSBC( 0  *contrast_factor, 'rgb(204, 51, 0)',false,false),
          'laptop':     pSBC( 0  *contrast_factor, 'rgb(255, 204, 0)',false,false),
          'other':      pSBC( 0  *contrast_factor, 'rgb(204, 51, 153)',false,false)}[t]
        if(!color)
          color = pSBC( 0.3*contrast_factor, grey_color,false,false);
      } else if(opt.group_name=='grey_uncertainty') {
        color = {
          'grey_0':    "rgba(255,255,255,0)",
          'grey_1':    pSBC( 0.3*contrast_factor, grey_color,false,false),
          'grey_2':    pSBC( 0.1*contrast_factor, grey_color,false,false),
          'grey_3':    pSBC(-0.1*contrast_factor, grey_color,false,false),
          'grey_4':    pSBC(-0.6*contrast_factor, grey_color,false,false)}[t]
      } else if(opt.group_name=='grey') {
        color = {
          'printer':    pSBC(-0.1*contrast_factor, grey_color,false,false),
          'desktop':    pSBC( 0  *contrast_factor, grey_color,false,false),
          'screen':     pSBC( 0.1*contrast_factor, grey_color,false,false),
          'laptop':     pSBC( 0.2*contrast_factor, grey_color,false,false),
          'pad':        pSBC( 0.3*contrast_factor, grey_color,false,false),
          'smartphone': pSBC( 0.3*contrast_factor, grey_color,false,false),
          'other':      pSBC( 0.3*contrast_factor, grey_color,false,false)}[t]
        if(!color)
          color = pSBC( 0.3*contrast_factor, grey_color,false,false);
      } else if(opt.group_name=='use') {
        color = {
          'desktop':  pSBC( 0  *contrast_factor, energy_color,false,false),
          'screen':   pSBC( 0.1*contrast_factor, energy_color,false,false),
          'laptop':   pSBC( 0.2*contrast_factor, energy_color,false,false),
          'other':    pSBC( 0.3*contrast_factor, energy_color,false,false)}[t]
        if(!color)
          color = energy_color
      } else {
        color = 'rgb(204,102,255)'
      }

      if(opt && opt.dim) {
        color = pSBC(opt.dim,color,false,false)
      }
      return color;
    },

    trigger_rendering() {
      this.active_data = this.output
    }

  },

  mounted() {

    this.setup_axis();

  },

  watch: {
    plotdata: function dataChanged() {
      var prev_upper_bound = this.cur_upper_bound;
      this.cur_upper_bound = this.vmax;
      this.setup_axis();
      if(prev_upper_bound!=this.cur_upper_bound) {
        setTimeout(this.trigger_rendering, 500);
      } else {
        this.trigger_rendering();
      }
    },
  },

  computed: {

    output() {
      var res = this.clone_obj(this.plotdata);
      res.forEach(function(cat){
        cat.data.forEach(function(sub){
          let sum = 0;
          sub.forEach(function(item) {sum += item.val; item['sum'] = sum;})
        })
      });
      return res;
    },

    y() {
      return d3scale.scaleBand().range([0, this.gridHeight]).padding(0.1)
            .domain(this.output.map(function(d) { return d.label; }));
    },

    x() {
      return d3scale.scaleLinear()
            .range([0, this.gridWidth])
            .domain([0, Math.round(this.vmax/10+1)*10])
    },

    vmax() {
      var upper_bound_list = [1, 10, 20, 30, 40, 50, 80, 100, 150, 200, 300, 400, 500, 800,
             1000,      1500,      2000,      3000,      4000,      5000,      8000,
            10000,     15000,     20000,     30000,     40000,     50000,     80000,
           100000,    150000,    200000,    300000,    400000,    500000,    800000,
          1000000,   1500000,   2000000,   3000000,   4000000,   5000000,   8000000,
         10000000,  15000000,  20000000,  30000000,  40000000,  50000000,  80000000,
        100000000, 150000000, 200000000, 300000000, 400000000, 500000000, 800000000]
      var max_val = this.output.reduce(
                            (r0,e0) => e0.data.reduce(
                              (r1,e1) => Math.max(r1,e1.uncertainty ? e1.uncertainty.sup : e1[e1.length-1].sum), r0), 0);
      var ideal_upper_bound = upper_bound_list.filter(e => e>=max_val)[0]

      /* eslint-disable vue/no-side-effects-in-computed-properties */
      if(max_val>this.cur_upper_bound)
        this.cur_upper_bound = ideal_upper_bound;
      else if(max_val*1.6<this.cur_upper_bound)
        this.cur_upper_bound = ideal_upper_bound;

      return this.cur_upper_bound
    },

    gridWidth()  { return this.width-this.margin.left-this.margin.right; },
    gridHeight() { return this.height-this.margin.top-this.margin.bottom; },

  },

  data() {
    return {
      margin: {left: 100, top: 5, bottom: 20, right:20},
      cur_upper_bound: 10,
      active_data:[],
      tooltip:{show:false,msg:"",style:{}}
    }
  }
}
</script>

<style scoped>


path {  /*stroke-width:1px;*/ stroke: #fff; }
/* path:hover, rect:hover { */
    /*fill-opacity: 0.8;*/
    /*stroke:white;*/
    /*stroke-width:2;*/
    /*fill: none;*/
/* } */
.axis {  font: 10px sans-serif; }

.axis path,
.axis line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges;
}

path.domain {
  stroke: none;
}

.serie rect:hover {
  cursor: pointer;
}

rect {
  transition: width 0.5s ease-in-out, x 0.5s ease-in-out;
}

div.tooltip { 
  position: absolute;
  text-align: center;
  width: 60px;
  padding: 2px;
  font: 14px sans-serif;
  background: #e8e6e3;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;

  opacity:0.8;
  transition: opacity .4s;
}

.tooltip-enter, .tooltip-leave-to  {
  opacity: 0;
}

.errorbar line {
  stroke: black;
  stroke-width:2;
  /* transition: x1 0.5s ease-in-out, x2 0.5s ease-in-out; */
  transition: all 0.5s ease-in-out; 
}

.errorbar rect {
  stroke: black;
  stroke-width:0;
  color: black;
}

.errorbar circle {
  stroke: black;
  transition: cx 0.5s ease-in-out;
  /* stroke-width:2; */
}
</style>
