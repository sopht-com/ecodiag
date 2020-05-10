
Vue.component('chart', {
  
  props: {
    'plotdata':Array,
    'height':{type: Number, default:150},
    'width':{type: Number, default:700},
  },

  template: /*html*/`
<div>
<transition name="tooltip">
  <div ref="tooltip" v-show="tooltip.show" class="tooltip" :style="tooltip.style" v-html="tooltip.msg"></div>
</transition>
<svg
  :height='height'
  :width='width'
>
  <g :transform="translate(margin.left,margin.top)">
    <g class="y axis" >
    </g>
    <g class="x axis" :transform="translate(0,gridHeight)">
    </g>
    <g class="category" v-for="(cat,k1) in active_data">
    
      <g class="subcategory" v-for="(sub,k2) in cat.data">
          <rect v-for="(item, i) in sub"
                :x="x(item.sum-item.val)"
                :y="y(cat.label) + k2*y.bandwidth()/cat.data.length"
                :width="x(item.sum)-x(item.sum-item.val)"
                :height="y.bandwidth()/cat.data.length"
                :fill="type2color(item.key, {dim: k2==0 ? 0 : 0.5 , contrast: 1, group_name:cat.key})"
                stroke="white" stroke-width="0"
                :id="'rect_'+k1+10*k2+100*i"
                :key="k1+10*k2+100*i"
                @mouseover="tooltip.show=true;tooltip.msg=item.label + '<br>' + Math.round(item.val)"
                @mouseout="tooltip.show=false"
                @mousemove="tooltip.style = {left:($event.pageX+2)+'px', top:($event.pageY+5)+'px'}"
          />
      </g>
    </g>
  </g>
</svg>
</div>
    `,

  methods: {

    // a simple hack to enable :transform="translate(...)" within the template
    translate(x,y) {
      return 'translate('+x+','+y+')';
    },

    // add axis through d3
    setup_axis() {
      var xaxis = d3.axisBottom(this.x)
            .ticks(5)
            .tickSize(-(this.gridHeight) , 0, 0);
      d3.selectAll(".x").transition().duration(500).call(xaxis);
      
      var yaxis = d3.axisLeft(this.y);
      d3.selectAll("g.y.axis").call(yaxis);

      d3.selectAll('g.y.axis g text').each(d3_insert_line_breaks);
    },

    type2color(t,opt) {

      var energy_color = 'rgb(0,102,204)';
      var contrast_factor = ((!opt) || opt.contrast==undefined) ? 0.5 : opt.contrast;
      var grey_color = 'rgb(128,128,128)';

      var color;

      if(opt.group_name=='grey') {
        color = {
          'printer':    pSBC(-0.1*contrast_factor, grey_color,false,false),
          'desktop':    pSBC( 0  *contrast_factor, grey_color,false,false),
          'screen':     pSBC( 0.1*contrast_factor, grey_color,false,false),
          'laptop':     pSBC( 0.2*contrast_factor, grey_color,false,false),
          'pad':        pSBC( 0.3*contrast_factor, grey_color,false,false),
          'smartphone': pSBC( 0.3*contrast_factor, grey_color,false,false),
          'other':      pSBC( 0.3*contrast_factor, grey_color,false,false)}
        [t];
        if(!color)
          color = pSBC( 0.3*contrast_factor, grey_color,false,false);
      } else if(opt.group_name=='use') {
        color = {
          'desktop':  pSBC( 0  *contrast_factor, energy_color,false,false),
          'screen':   pSBC( 0.1*contrast_factor, energy_color,false,false),
          'laptop':   pSBC( 0.2*contrast_factor, energy_color,false,false),
          'other':    pSBC( 0.3*contrast_factor, energy_color,false,false)}
        [t];
        if(!color)
          color = energy_color;
      } else {
        color = 'rgb(204,102,255)';
      }

      if(opt && opt.dim) {
        color = pSBC(opt.dim,color,false,false);
      }
      return color;
    },

    trigger_rendering() {
      this.active_data = this.output;
    }

  },

  mounted() {

    this.setup_axis();

  },

  watch: {
    plotdata: function dataChanged() {
      var prev_upper_bound = this.cur_upper_bound;
      this.cur_upper_bound = this.vmax;
      if(prev_upper_bound!=this.cur_upper_bound) {
        this.setup_axis();
        setTimeout(this.trigger_rendering, 500);
      } else {
        this.trigger_rendering();
      }
    },
  },

  computed: {

    output() {
      var res = clone_obj(this.plotdata);
      res.forEach(function(cat){
        cat.data.forEach(function(sub){
          var sum = 0;
          sub.forEach(function(item) {sum += item.val; item['sum'] = sum;})
        })
      });
      return res;
    },

    y() {
      return d3.scaleBand().range([0, this.gridHeight]).padding(0.1)
            .domain(this.output.map(function(d) { return d.label; }));
    },

    x() {
      return d3.scaleLinear()
            .range([0, this.gridWidth])
            .domain([0, Math.round(this.vmax/10+1)*10]);
    },

    vmax() {
      var upper_bound_list = [1, 10, 20, 30, 40, 50, 80, 100, 150, 200, 300, 400, 500, 800, 1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000, 30000, 40000, 50000, 80000, 100000, 150000, 200000, 300000, 400000, 500000];
      var max_val = this.output.reduce(
                            (r0,e0) => e0.data.reduce(
                              (r1,e1) => Math.max(r1,e1[e1.length-1].sum), r0), 0);
      var ideal_upper_bound = upper_bound_list.filter(e => e>=max_val)[0];

      if(max_val>this.cur_upper_bound)
        this.cur_upper_bound = ideal_upper_bound;
      else if(max_val*1.6<this.cur_upper_bound)
        this.cur_upper_bound = ideal_upper_bound;

      return this.cur_upper_bound;
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
})

