
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
  var factor = conv.to_CO2[type];
  if(!factor)
    factor = devices[type].grey_CO2;
  if(model && model!='default'){
    if(devices[type].models[model].grey_CO2)
      factor = devices[type].models[model].grey_CO2;
    else
      factor = devices[type].models[model];
  }
  return factor;
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
  return {
    nb:       item.nb ? item.nb : item,
    lifetime: item.lifetime ? item.lifetime : get_device_attribute(type,model,'duration'),
    usage:    item.usage    ? item.usage    : get_device_attribute(type,model,'usage')
  };
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

    var item = consolidate_device_item(type,model,item_data);
    item['type'] = type;
    item['model'] = model;
    item['lifetime2'] = item['lifetime']*1.5;

    res.push(item);

  });
  return res;
}
