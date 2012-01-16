var plot = function (data, name) {
  var context    = this,
      domainFlag = false,
      rangeFlag  = false;

  var xmax = ymax = Number.MIN_VALUE,
      xmin = ymin = Number.MAX_VALUE;

  for ( var t in data ) {
    // compute the domain and range of the signal passed
    xmax = (xmax < t) ? t : xmax;
    xmin = (xmin > t) ? t : xmin;

    ymax = (ymax < data[t]) ? data[t] : ymax;
    ymin = (ymin > data[t]) ? data[t] : ymin;
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

  if (!context.grid) { crayon.bus.publish('FirstPlot', [context]) }

  if ( domainFlag ) {
    crayon.bus.publish('DomainChanged', [context]);
  }  
  if ( rangeFlag ) {
    crayon.bus.publish('RangeChanged', [context]);
  }
}

crayon.handle.plot = plot;
