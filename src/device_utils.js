
var params = {
  default_uncertainty: 30,
  lifetime_uncertainty: 1
};

// returns "type/model" unless model is null or "default" in which case we simply return type
function make_device_name(type,model) {
  if(model && model!="" && model!="default")
    return type+"/"+model;
  return type;
}

// if name matches "type/model" return ["type","model"]
// otherwise check whether "name" is a valid device model,
//    if so return ["type","name"]
//    otherwise "name" is a type and return ["name"]
function device_name_to_type_model(name) {
  var type_model = name.split('/');
  if(type_model.length==2 || ((typeof purchase_types !== 'undefined') && type_model[0] in purchase_types))
    return type_model;
  // search within devices
  for(var k in devices) {
    var model = type_model[0];
    var d = devices[k];
    if(d.models && model in d.models)
      return [k,model];
  }

  return type_model;
}

// returns grey CO2 factor from a type/model pair
// - model is optional
function get_device_factor(type,model) {
  function getmean(el) {
    if(el.mean)
      return el.mean;
    else
      return el;
  }
  function getstd(el) {
    if(el.std)
      return el.std;
    else
      return params.default_uncertainty/100; // default is 30%
  }
  var mean = conv.to_CO2[type];
  var device_CO2 = devices[type].grey_CO2;
  var std = getstd(device_CO2);
  if(!mean)
    mean = getmean(device_CO2);
  if(model && model!='default'){
    var model_CO2;
    if(devices[type].models[model].grey_CO2)
      model_CO2 = devices[type].models[model].grey_CO2;
    else
      model_CO2 = devices[type].models[model];
      mean = getmean(model_CO2);
    std = getstd(model_CO2);
  }
  return {mean:mean,std:std};
}

function get_yearly_consumption(item) {
  if(item.yearly_consumption)
    return item.yearly_consumption;
  else
    return get_device_attribute(item.type,item.model,'yearly_consumption');
}

// returns the attribute "attr" from a type/model pair
// - model is optional 
function get_device_attribute(type,model,attr) {
  var res = undefined;
  var device = devices[type];
  if(device) {
    res = device[attr];
    if(model && model!='default' && devices[type].models[model][attr]){
      res = devices[type].models[model][attr];
    }  
  }
  return res;
}

function consolidate_device_item(type,model,item) {
  const lifetime = item.lifetime ? item.lifetime : get_device_attribute(type,model,'duration');
  return {
    type: type,
    model: model,
    nb:                 item.nb                 ? item.nb                 : item,
    lifetime:           lifetime,
    lifetime2:          item.lifetime2          ? item.lifetime2          : lifetime*1.5,
    yearly_consumption: item.yearly_consumption ? item.yearly_consumption : get_device_attribute(type,model,'yearly_consumption'),
    usage:              item.usage              ? item.usage              : get_device_attribute(type,model,'usage')
  };
}

function get_default_model(type) {
  if(devices[type].models) {
    var res = {
      'desktop': 'ecodiag_avg_PC',
      'laptop':  'ecodiag_avg_laptop',
      'printer': 'office_40_99kg'} [type];
    if(res)
      return res;
    return 'default';
  } else {
    return undefined;
  }
}

function pack_device_list(d) {
  var res = [];
  d.forEach(function(x) {
    var item = {};
    item[make_device_name(x.type,x.model)] = {nb:x.nb, lifetime:x.lifetime};
    res.push(item);
  });
  return res;
}

function unpack_device_list(d) {
  var res = [];
  d.forEach(function(x) {
    var item_name = Object.keys(x)[0];
    var item_data = Object.values(x)[0];
    
    var type_model = device_name_to_type_model(item_name);
    var type = type_model[0];
    var model = 'default';
    
    if(type_model.length==2)
      model = type_model[1];

    res.push( consolidate_device_item(type,model,item_data) );

  });
  return res;
}

function LogNormalFromMeanAndRelStdev(mean,relative_stdev) {
  var si2 = Math.log(Math.pow(relative_stdev,2)+1);
  return LogNormal(Math.log(mean)-0.5*si2, Math.sqrt(si2));
}

var _a = ((8*(Math.PI - 3)) / ((3*Math.PI)*(4 - Math.PI)));

function my_erfinv( x )
{
  var z = 0;
  var a = 0.147;                                                   
  var sign_x;
  if(0==x) {
    sign_x = 0;
  } else if(x>0){
    sign_x = 1;
  } else {
    sign_x = -1;
  }

  if(0 != x) {
    var tmp1 = Math.log(1-x*x);
    var tmp2 = tmp1 / 2 + (2/(Math.PI * a));
    z = Math.sqrt(Math.sqrt((tmp2*tmp2) - tmp1/a) - tmp2) * sign_x;
  }
  return z;
}

function LogNormal(mu,sigma) {
  this.mu = mu;
  this.sigma = sigma;

  this.pdf = function(x) {
    return Math.exp(-Math.pow(Math.log(x)-mu,2)/(2*sigma*sigma))/(x*sigma*Math.sqrt(2*Math.pi));
  }
  
  this.cdf = function(x) {
    return 0.5*0.5*Math.erf((Math.log(x)-mu)/(Math.sqrt(2)*sigma));
  }
  
  this.inv = function(p) {
    return Math.exp(mu+Math.sqrt(2*sigma*sigma) * my_erfinv(2*p-1));
  }

  return this;
}

