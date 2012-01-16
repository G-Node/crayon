// First create the internal (jquery) event bus
crayon.bus = {
  subscribe : function (event, fn) {
                $(this).bind(event, fn);
              },
  publish   : function (event, params) {
                $(this).trigger(event, params);
              }
}

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
  var handle = crayon.deepcopy(crayon.handle);

  // set miscellaneous instance variables
  handle.div     = div;
  handle.p       = 20;  // padding
  handle.w       = div.style('width');
  handle.h       = div.style('height');

  var element = div
    .append('svg')
    .attr('width', handle.w)
    .attr('height', handle.h)


  // instance variables containing grid information
  handle.xmax = undefined; 
  handle.xmin = undefined;

  handle.ymax = undefined;
  handle.ymin = undefined;

  handle.element = element;

  return handle;
}

crayon.init = init;
