crayon.handle.clear = function () {
  /* Just remove all the signals. and the grid */
  this.signals.remove();
  this.grid.remove();
  this.overlay.remove();


  /* Then add the bare minimums */
  this.grid = this.element 
    .append('g')
    .attr('id', 'grid')
    .attr('transform', 'translate('+ this.px.toString() + ',' + 
                                    (parseInt(this.h) - this.py).toString() + ')' +
                       'scale(1,-1)'
    );


  this.signals = this.element
    .append('g')
    .attr('id', 'signals')
    .attr('transform', 'translate('+ this.px.toString() + ',' + 
                                    (parseInt(this.h) - this.py).toString() + ')' +
                       'scale(1,-1)'
    );

  this.color = crayon.color_init();

  if (this.options.interaction.selections){
    crayon.drag_init(this);
  }

  this.xmax = undefined;
  this.ymax = undefined;
  this.xmin = undefined;
  this.ymin = undefined;
};
