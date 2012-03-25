crayon.bus.subscribe('FirstDraw', function(event, context, data) {
  // setup grid SVG groups
  context.grid = context.element
    .append('g')
    .attr('id', 'grid')
    .attr('transform', 'translate('+ context.p.toString() + ',' + 
                                    (parseInt(context.h) - context.p).toString() + ')' +
                       'scale(1,-1)'
  );

  // draw axes
  context.axes = context.grid
    .append('g')
    .attr('class', 'axes');
 
  context.axes // y axis
    .append('line')
    .attr('x1', '0')
    .attr('y1', '0')
    .attr('x2', '0')
    .attr('y2', context.h);

  context.axes // x axis
    .append('line')
    .attr('x1', '0')
    .attr('y1', '0')
    .attr('x2', context.w) 
    .attr('y2', '0');

});

crayon.bus.subscribe('DomainChanged', function(event, context, data) {
  var x = context.x;

  // remove previous x grid if any
  context.grid.select('g.xrule')
    .transition()
    .style('opacity', 0)
    .remove();

  // create new x grid
  context.xrules = context.grid
    .append('g')
    .style('opacity', '0')
    .attr('class', 'xrule');

  // grid lines
  context.xrules.selectAll('line')
    .data(x.ticks(10))
    .enter().append('line')
    .attr('x1', x)
    .attr('y1', 0)
    .attr('x2', x)
    .attr('y2', context.h);

  // grid markings
  if (context.ticks) {
    context.xrules.selectAll('text')
      .data(x.ticks(10))
      .enter().append('text')
      .attr('transform', 'scale(1,-1)')
      .attr('text-anchor', 'middle')
      .attr('x', x)
      .attr('y', 15)
      .text(function(d) { return Math.round(d *1000) / 1000.0; });
  }

  // make it visible
  context.xrules
    .transition()
    .style('opacity', '1');
});

crayon.bus.subscribe('RangeChanged', function(event, context, data) {
  var y = context.y; 

  // remove previous x grid if any
  context.grid.select('g.yrule')
    .transition()
    .style('opacity', 0)
    .remove();

  // create new y grid
  context.yrules = context.grid
    .append('g')
    .style('opacity', '0')
    .attr('class', 'yrule');

  // grid lines
  context.yrules.selectAll('line')
    .data(y.ticks(5))
    .enter().append('line')
    .attr('x1', 0)
    .attr('y1', y)
    .attr('x2', context.w)
    .attr('y2', y);
  
  context.yrules.selectAll('text')
    .data(y.ticks(5))
    .enter().append('text')
    .attr('transform', 'scale(1,-1)')
    .attr('text-anchor', 'end')
    .attr('x', -3)
    .attr('y', function(d) { return - parseInt(y(d)); })
    .text(function(d) { return Math.round(d *1000) / 1000.0; });

  // make it visible
  context.yrules
    .transition()
    .style('opacity', '1');
});
