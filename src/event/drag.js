crayon.drag_init = function (context) {
  var node = context.div.select('svg').node(),
      div  = context.div.node(),
      flag = false,
      /* Denotes whether a drag is in progress or not */
      start, end;

  var height    = parseInt(d3.select(node).style('height'));
  var positionX = parseInt($(div).offset().left) + 1 + context.px;

  var rect = d3.select(node)
    .append('g')
    .classed('overlay', true)
    .attr('transform', 'translate('+ context.px.toString() + ',' + 
                       (parseInt(context.h) - context.py).toString() + ')' +
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
      } else {
      /* Firing selection events only for selections larger than
       * 5pixels */
        if ( start < end ) {
          crayon.bus.publish("Selection", [context, {
              start: context.x.invert(start),
              end  : context.x.invert(end)
            }]);
        } else {
          crayon.bus.publish("Selection", [context, {
              start: context.x.invert(end),
              end  : context.x.invert(start)
          }]);
        }
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

  context.onselection = function (callback) {
    /* Can be used to communicate selections to the outside world. */
    crayon.bus.subscribe("Selection", function (event, _context, t_values) {
        if (_context == context) {
          callback(event, _context, t_values);
        }
    });
  }
};
