
function clone_obj(x) {
   var res;
   res = Array.isArray(x) ? [] : {};
   for (key in x) {
       var v = x[key];
       res[key] = (typeof v === "object") ? clone_obj(v) : v;
   }
   return res;
}

function toFixed(value, precision) {
  var power = Math.pow(10, precision || 0);
  return Math.round(value * power) / power;
}

