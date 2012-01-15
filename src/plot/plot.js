var plot = function (data, name) {
  var that = this;

  var xmax = ymax = Number.MIN_VALUE; 
  var xmin = ymin = Number.MAX_VALUE;

  that.element = that.div
    .append('svg')
    .attr('width', that.w)
    .attr('height', that.h)
    .append('g');

  for ( var t in data ) {
    // compute the domain and range of the signal passed
    xmax = (xmax < t) ? t : xmax;
    xmin = (xmin > t) ? t : xmin;

    ymax = (ymax < data[t]) ? data[t] : ymax;
    ymin = (ymin > data[t]) ? data[t] : ymin;
  }

  that.xmax = xmax;
  that.xmin = xmin;
  that.ymax = ymax;
  that.ymin = ymin;

  crayon.bus.publish('DomainChanged');
  crayon.bus.publish('RangeChanged');
}

crayon.handle.plot = plot;
