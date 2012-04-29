var deepcopy = function(o) {
  // Creates new objects. Not passing references. :)
  var F = function() {};
  F.prototype = o;
  return new F();
};

window.crayon = (function() {
  var bus = {
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
                                 .range([0, context.h - context.py ]);
      crayon.bus.publish('RangeChanged', [context, 
                { ol : [oldymin, oldymax],
                  ne : [context.ymin, context.ymax] }]);
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
                                 .range([0, context.w - context.px ]);
     crayon.bus.publish('DomainChanged', [context,
         { ol : [oldxmin, oldxmax],
           ne : [context.xmin, context.xmax] } ]);
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
  var init = function (selector, opts) {
    var div = d3.select(selector);

    // now create the object that encapsulates all plotting features
    var handle = deepcopy(crayon.handle),
        options = {
          colors : ['#1BA5E0', '#E68415', '#E61F15', '#2B6B1B'],
          xaxis :  {
              showTicks: true, 
              position: 'bottom',
              transform: null, // null or f : number -> string
              margin: null, // null or pixels which contain ticks
              tickNumber: null, // null = auto-detect OR number of ticks  
              tickDecimals: null // null = auto-detect OR number of decimal places
          },
          yaxis :  {
              showTicks: true, 
              position: 'bottom',
              transform: null, // null or f : number -> string
              margin: null, // null or pixels which contain ticks
              tickNumber: null, // null = auto-detect OR number of ticks  
              tickDecimals: null // null = auto-detect OR number of decimal places
          },
          interaction : {
              selections: true // false to disable selections
          },
        };

    handle.options = parseOptions(options, opts);

    /* Initialize color mechanism */
    handle.color = crayon.color_init(); 

    // set miscellaneous instance variables
    handle.div     = div;
    handle.px      = 20;
    handle.py      = 20;
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

    /* Initialize all context-sensitive features */
    crayon.drag_init(handle);

    return handle;
  }

  function parseOptions(options, opts) {
    /* For now, doing a simple recursive merge. May extend this
     * function further if more complex options are added. */ 
    return $.extend(true, options, opts);
  };

  return {
    handle     : {},
    // used to add abilities to crayon in other files.
    bus        : bus,
    init       : init
  }
})();
