var plot = function (data, name) {
  var context    = this,
      domainFlag = false,
      rangeFlag  = false;

  var xmax = ymax = Number.MIN_VALUE,
      xmin = ymin = Number.MAX_VALUE;

  for ( var i = 0; i < data.length; i++) { 
    var u = data[i]; // u means unit

    // compute the domain and range of the signal passed
    xmax = (xmax < u.x) ? u.x : xmax;
    xmin = (xmin > u.x) ? u.x : xmin;

    ymax = (ymax < u.y) ? u.y : ymax;
    ymin = (ymin > u.y) ? u.y : ymin;
  }
  if ( !context.grid ) {
    // This is the first time, right
    context.xmax = xmax;
    context.xmin = xmin;
    context.ymax = ymax;
    context.ymin = ymin;

    rangeFlag = domainFlag = true;
  } else {
    if ( context.xmax < xmax ) { 
      domainFlag = true;
      context.xmax = xmax;
    }
    if ( context.xmin > xmin ) { 
      domainFlag = true;
      context.xmin = xmin;
    }
    if ( context.ymax < ymax ) { 
      rangeFlag = true;
      context.ymax = ymax;
    }
    if ( context.ymin > ymin ) { 
      domainFlag = true;
      context.ymin = ymin;
    }
  }

  // create the x and y coordinate mappings
  context.x = d3.scale.linear().domain([context.xmin, context.xmax]).range([0, context.w]);
  context.y = d3.scale.linear().domain([context.ymin, context.ymax]).range([0, context.h]);

  if (!context.grid) { crayon.bus.publish('FirstPlot', [context]) }

  if ( domainFlag ) {
    crayon.bus.publish('DomainChanged', [context]);
  }  
  if ( rangeFlag ) {
    crayon.bus.publish('RangeChanged', [context]);
  }

  crayon.bus.publish('SignalAdded', [context, data, name]);
}

crayon.handle.plot = plot;
