var deepcopy = function(o) {
  // Creates new objects. Not passing references. :)
  var F = function() {};
  F.prototype = o;
  return new F();
};

window.crayon = {
  handle     : {},
  deepcopy   : deepcopy
};
