crayon.bus.subscribe('FirstDraw', function (event, context, data) {
  // add the signals SVG groups
  context.signals = context.element
    .append('g')
    .attr('id', 'signals')
    .attr('transform', 'translate('+ context.px.toString() + ',' + 
                                    (parseInt(context.h) - context.py).toString() + ')' +
                       'scale(1,-1)'
  );
});

var drawSignal = function (data, name, color) {
  var context    = this,
      domainFlag = false,
      rangeFlag  = false,
      color      = ( color == undefined ) ? context.color() : color;


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
  
  context.updateDomain([xmin, xmax]);
  context.updateRange([ymin, ymax]);

  // create the x and y coordinate mappings
  crayon.bus.publish('SignalAdded', [context, data, name, color]);

  return color; /* Could be used as an identifier in calling code. */
}

crayon.bus.subscribe('SignalAdded', function (event, context, data, name, color) {
  // Draw the signal
  context.signals
    .append('path')
    .data([data])
    .style('stroke', color)
    .attr('id', name)
    .attr('d', d3.svg.line()
      .x(function(d) { return context.x(d.x); })
      .y(function(d) { return context.y(d.y); })
    );
});

var scale = function(event, context, data) {
  if ( data.ol != data.ne ){
    context.signals
      .selectAll('path')
      .transition()
      .attr('d', d3.svg.line()
        .x(function(d) { return context.x(d.x); })
        .y(function(d) { return context.y(d.y); })
      );
  }
}

crayon.bus.subscribe('RangeChanged', scale);
crayon.bus.subscribe('DomainChanged', scale);

crayon.handle.drawSignal = drawSignal;
