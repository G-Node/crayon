var plot = function (data, name) {
  var context = this;

  var xmax = ymax = Number.MIN_VALUE; 
  var xmin = ymin = Number.MAX_VALUE;

  for ( var t in data ) {
    // compute the domain and range of the signal passed
    xmax = (xmax < t) ? t : xmax;
    xmin = (xmin > t) ? t : xmin;

    ymax = (ymax < data[t]) ? data[t] : ymax;
    ymin = (ymin > data[t]) ? data[t] : ymin;
  }

  context.xmax = xmax;
  context.xmin = xmin;
  context.ymax = ymax;
  context.ymin = ymin;

  if (!context.grid) { crayon.bus.publish('FirstPlot', [context]) }

  crayon.bus.publish('DomainChanged', [context]);
  crayon.bus.publish('RangeChanged', [context]);
}

crayon.handle.plot = plot;
