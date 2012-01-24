// First create the internal (jquery) event bus
crayon.bus = {
  subscribe : function (event, fn) {
                $(this).bind(event, fn);
              },
  publish   : function (event, params) {
                $(this).trigger(event, params);
              }
}

var updateRange = function(range) {
  // pass a [ymin, ymax] array to this function to update the current
  // context's range.  If a range update is done, publish the
  // RangeChanged event and return true. Else, return false. 
  var context = this,
      flag    = false;
      oldymin = oldymax = undefined;

  if (context.ymax == undefined) {
    // first time
    flag         = true;
    context.ymin = range[0];
    context.ymax = range[1];
  } else {
    if ( context.ymin > range[0] ) { 
      flag         = true;
      oldymin      = context.ymin;
      context.ymin = range[0];
    }if ( context.ymax < range[1] ) { 
      flag         = true;
      oldymax      = context.ymax;
      context.ymax = range[1];
    }
  }

  if ( flag ) {
    context.y = d3.scale.linear().domain([context.ymin, context.ymax])
                               .range([0, context.h - context.p ]);
    crayon.bus.publish('RangeChanged', [context, 
              { old : [oldymin, oldymax],
                new : [context.ymin, context.ymax] }]);
  }

  return flag;
}

var updateDomain = function(domain) {
  // pass a [xmin, xmax] array to this function to update the current
  // context's domain.  If a domain update is done, publish the
  // DomainChanged event and return true. Else, return false. 
  var context = this,
      flag    = false,
      oldxmin = oldxmax = undefined;

  if (context.xmax == undefined) {
    // first time
    flag         = true;
    context.xmin = domain[0];
    context.xmax = domain[1];
  } else {
    if ( context.xmin > domain[0] ) { 
      flag         = true;
      oldxmin      = context.xmin;
      context.xmin = domain[0];
    }if ( context.xmax < domain[1] ) { 
      flag         = true;
      oldxmax      = context.xmax;
      context.xmax = domain[1];
    }
  }
  
  if ( flag ) {
   context.x = d3.scale.linear().domain([context.xmin, context.xmax])
                               .range([0, context.w - context.p ]);
   crayon.bus.publish('DomainChanged', [context,
       { old : [oldxmin, oldxmax],
         new : [context.xmin, context.xmax] } ]);
  }

  return flag;
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
  handle.w       = parseInt(div.style('width'));
  handle.h       = parseInt(div.style('height'));

  var element = div
    .append('svg')
    .attr('width', handle.w)
    .attr('height', handle.h)


  // instance variables containing grid information
  handle.xmax = undefined; 
  handle.xmin = undefined;

  handle.ymax = undefined;
  handle.ymin = undefined;

  handle.updateDomain = updateDomain;
  handle.updateRange = updateRange;

  handle.element = element;

  if (!handle.grid) { crayon.bus.publish('FirstDraw', [handle]) }

  return handle;
}

crayon.init = init;
