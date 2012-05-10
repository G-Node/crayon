crayon.bus.subscribe('FirstDraw', function (event, context, data) {
  // add the spikes SVG group
  context.spikes = context.element
    .append('g')
    .attr('id', 'spikes')
    .attr('transform', 'translate(' + context.px.toString() + ',' + 
                                    (parseInt(context.h) - context.py).toString() + ')' +
                       'scale(1,-1)'
  );

  // add the spikes data array
  context.spikes_data = [];
});


var drawSpikeTrain = function (data, name, color) {
  var context    = this,
      domainFlag = false,
      color      = ( color == undefined ) ? context.color() : color,

      xmax = Number.MIN_VALUE,
      xmin = Number.MAX_VALUE;

  context.spikes_data.push(data);

  for ( var i=0; i<data.length; i++) {
    var u = data[i];
    if ( u < xmin ) { xmin = u; }
    if ( u > xmax ) { xmax = u; }
  }

  context.updateDomain([xmin, xmax]);

  // create the x coordinate system
  crayon.bus.publish('SpikeTrainAdded', [context, data, name, color]);
  
  return color; /* Could be used as an identifier in calling code. */
},   

_drawAllTrains =  function (event, context, data, name, color) {
   /* Clears all existing trains and draws them again according to the
    * current coordinate system.
    */
   var spikes_data = context.spikes_data, // local reference
       n, spike_h, spike_spacing; // effective number of spikes 

    context.spikes
      .selectAll('g')
      .transition()
      .style('opacity', 0)
      .remove();

    /* Note, one could think that there would be a race condition here
     * because the domain may not have been updated before this
     * function is called, crayon being an async library.  However,
     * careful reading will tell you that context.updateDomain()
     * returns/publishes only after the context.x values have been
     * updated. Since we publish the event that gets this function
     * called only after context.updateDomain() has returned, we are
     * safe from the race condition. Phew!! */

    // compute individual spike height from number of spikes
    if (spikes_data.length < 2) { n = 2; } 
    else { n = spikes_data.length; }

    spike_h = context.h / ( 1.5*n + 0.5); 
    spike_spacing = spike_h / 2;
    /* A simple algorithm is at work here.
     * - Assume atleast two spiketrains.  
     * - spike_spacing is half of spike_h
     * - the bottommost spike and the topmost spike have spike_spacing
     *   from the bottom and top limits of plot respectively
     */

    // Now add all spikes from spikes_data
    for (var i=0; i<spikes_data.length; i++) {
      y1 = (i + 1) * spike_spacing + (i) * spike_h;
      y2 = y1 + spike_h;

      context.spikes
        .append('g')
        .attr('id', name)
        .style('stroke', color)
        .selectAll('line')
        .data(spikes_data[i])
        .enter().append('line')
        .attr('x1', context.x)
        .attr('y1', y1)
        .attr('x2', context.x)
        .attr('y2', y2);
    }
};

crayon.bus.subscribe('SpikeTrainAdded', _drawAllTrains);

crayon.handle.drawSpikeTrain = drawSpikeTrain;
