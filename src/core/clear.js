crayon.handle.clear = function () {
  /* Just remove all the signals. */
  this.signals.remove();

  this.signals = this.element
    .append('g')
    .attr('id', 'signals')
    .attr('transform', 'translate('+ this.p.toString() + ',' + 
                                    (parseInt(this.h) - this.p).toString() + ')' +
                       'scale(1,-1)'
    );
};
