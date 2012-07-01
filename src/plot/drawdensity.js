crayon.bus.subscribe('FirstDraw', function (event, context, data) {
  // add the density SVG group
  context.density = context.element
    .append('g')
    .attr('id', 'density')
    .attr('transform', 'translate(' + context.px.toString() + ',' +
        (parseInt(context.h) - context.py).toString() + ')' 
        + 'scale(1,-1)'
  );


  // add the density array 
  context.density_data = [];
});

var drawDensityPlot = function (data, name, color) {
  var context = this
    , domainFlag = false
    , color = ( color == undefined ) ? context.color() : color

    , xmax = Number.MIN_VALUE;
    , xmin = Number.MAX_VALUE;

  context.density_data.push(data);

  for ( var i=0; i<data.length; i++) {

      
