var deepcopy = function(o) {
  // Creates new objects. Not passing references. :)
  var F = function() {};
  F.prototype = o;
  return new F();
};

window.crayon = {
  version    : '0.0.1',
  handle     : {},
  deepcopy   : deepcopy
};
