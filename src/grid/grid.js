crayon.bus.subscribe('DomainChanged', function(event, context, data) {
  var x = d3.scale.linear().domain([context.xmin, context.xmax]).range([0, context.w]),
      y = d3.scale.linear().domain([context.ymin, context.ymax]).range([0, context.h]);

  context.xrules = context.element.selectAll('g.xrule')
    .data(x.ticks(10))
    .enter().append('g')
    .attr('class', 'xrule');

  context.xrules.append('line')
    .attr('x1', x)
    .attr('y1', 0)
    .attr('x2', x)
    .attr('y2', context.h);

  context.yrules = context.element.selectAll('g.yrule')
    .data(y.ticks(5))
    .enter().append('g')
    .attr('class', 'yrule');

  context.yrules.append('line')
    .attr('x1', 0)
    .attr('y1', y)
    .attr('x2', context.w)
    .attr('y2', y);
  
  context.element.selectAll('text')
    .data(['holiday'])
    .enter().append('text')
    .attr('x', 30)
    .attr('y', 30)
    .text(function(d) { return d;});
});
