crayon.drag_init = function (context) {
  var node = context.div.select('svg').node(),
      div  = context.div.node(),
      flag = false,
      /* Denotes whether a drag is in progress or not */
      start, end;

  var height    = parseInt(d3.select(node).style('height'));
  var positionX = parseInt($(div).position().left) + 1 + context.p;

  var rect = d3.select(node)
    .append('g')
    .classed('overlay', true)
    .attr('transform', 'translate('+ context.p.toString() + ',' + 
                       (parseInt(context.h) - context.p).toString() + ')' +
                       'scale(1,-1)'
    )
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 0)
    .attr('height', height);

  $(div).mousedown(function(event) {
    flag = true;
    start = event.clientX - positionX; 

  
    rect.attr('x', start)
      .attr('width', 1); 

    event.stopPropagation();
  });

  $(div).mouseup(function(event) {
    if (flag) {
      flag = false;
      end = event.clientX - positionX; 

      if ( Math.abs(start - end) < 5 ) {
      /* Ignoring selections smaller than 5 pixels */
        rect.attr('x', 0).attr('width', 0);
      }
    }

    event.stopPropagation();
  });

  $(div).mouseleave(function(event) {
    event.stopPropagation();
  });

  $(div).mousemove(function(event) {
    if (flag) {
      var width = event.clientX - positionX - start;
      if ( width < 0 ) {
        rect.attr('width', -width)
          .attr('x', start + width);
      }else {
        rect.attr('width', event.clientX - positionX - start);
      }

      event.stopPropagation();
    }
  });
};
