// This sets up the initialization functions which should work like :
//  <script>
//    var c = crayon.init('<<css_div_selector_here>>');
//    # ^^ we are trying to setup crayon.init here
//
//    c.addSignal({..});
//  </script>

var init = function (selector) {
  var div = d3.select(selector);

  // now create the object that encapsulates all plotting features
  var rtn = crayon.deepcopy(crayon.handle);

  rtn.div = div;
  rtn.p = 20;
  rtn.w = div.style('width');
  rtn.h = div.style('height');
}

crayon.init = init;
