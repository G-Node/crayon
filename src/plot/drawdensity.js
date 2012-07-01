crayon.bus.subscribe('FirstDraw', function (event, context, data) {
  // add the density SVG group
  context.density = context.element
    .append('g')
    .attr('id', 'density')
    .attr('transform', 'translate(' + context.px.toString() + ',' +
        (parseInt(context.h) - context.py).toString() + ')' 
        + 'scale(1,-1)'
  );

  context.density_data = [];
  context.density_color = [];
});

var drawDensityPlot = function (data, name, color) {
  var context = this
    , domainFlag = false
    , color = ( color == undefined ) ? context.color() : color

    , xmax = ymax = Number.MIN_VALUE
    , xmin = Number.MAX_VALUE;

  context.density_data.push(data);
  context.density_color.push(color);


  for ( var i=0; i<data.length; i++) {
    var u = data[i]; // u means unit

    // compute the domain and range of the density plot
    xmax = (xmax < u.x) ? u.x : xmax;
    xmin = (xmin > u.x) ? u.x : xmin;

    ymax = (ymax < u.y) ? u.y : ymax;
  }

  context.updateDomain([xmin, xmax]);

  // create the x and y coordinate mappings
  crayon.bus.publish('DensityPlotAdded', [context, data, name, ymax, color]);

  return color;
}

var _drawAllDensities = function (event, context, data, name, ymax, color) {
  context.density.html('');
  
  var i

    , density_data  = context.density_data
    , density_color = context.density_color
    , n             = (density_data.length < 2) ? 2 : density_data.length
    , available_h   = context.h

    , dense_height  = available_h / ( 2.5 * n + 0.5)
    , dense_spacing = dense_height / 2 ;


  for ( i=0; i<density_data.length; i++ ) {
    var y1 = (i + 1) * dense_spacing + (i) * dense_height
      , color0 = d3.hsl(d3.hsl(density_color[i]).h, 
                        d3.hsl(density_color[i]).s, 0.1)

      , color1 = d3.hsl(d3.hsl(density_color[i]).h,
                        d3.hsl(density_color[i]).s, 0.9)
      , color = d3.interpolateHsl(color1, color0)

 ;



    context.density
      .append('g')
      .attr('id', name)
      .style('stroke', color)
      .selectAll('rect')
      .data(density_data[i])
      .enter().append('rect')
      .attr('x', function (d) {
          return context.x(d.x);
        })
      .attr('y', y1)
      .attr('width', 10)
      .attr('height', dense_height) 
      .style('fill', function (d) {
          return color((d.y/ymax));
      })
      .attr('title', function (d) {
          return d.y;
      });
  }
};


crayon.bus.subscribe('DensityPlotAdded', _drawAllDensities);
crayon.bus.subscribe('DomainChanged', _drawAllDensities);

crayon.handle.drawDensityPlot = drawDensityPlot;


      
