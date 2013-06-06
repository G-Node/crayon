// ---------- file: cry/plotmanager.js ---------- //

// Augment the module cry and import d3 locally.
var cry; (function(cry, d3, $) {
  "use strict";

  /*******************************************************************************
   * Class PlotManager.
   * The plot manager is the central class of the crayon library, it handles data
   * sources, contexts and renderer.
   *
   * @returns {Function} Constructor for PlotManager
   ******************************************************************************/
  cry.PlotManager = (function() {

    /**
     * Constructor of the class PlotManager.
     *
     * @param svg {d3.selection}   An svg elements as d3 selection.
     */
    function PlotManager(svg) {
      // initialize d3 handle for svg
      if (typeof(svg) === 'string')
        this._svg = d3.select('#'+svg);
      else
        this._svg = svg;
      // structure for renderer:
      // {<name>: <renderer>, ...}
      this._renderer = {};
      // structure for contexts:
      // {<name>: <context>, ... }
      this._contexts = {};
      // sources
      // [{renderer: <name>, context: <name>, source: <source>}]
      this._sources = [];
      // geometry of the svg elment
      this._width  = this._svg.attr('width');
      this._height = this._svg.attr('height');

      // the default context
      this._default;

      // calculated borders
      this._borders = null;

      // create a context for selections
      this._selconfig  = {width: this._width, height: 100, yticks: 2,
                          onselect: this._onselect()};
      this._selcontext = new cry.Context(this._svg, 'select', this._selconfig);
      this._selcontext.svg().attr("transform", "translate(0," + (this._height-this._selconfig.height) + ")");
    }

    /**
     * Plot all data from all sources using the configured renderer and context.
     */
    PlotManager.prototype.plot = function() {
    	var count = 0, 
	        that  = this,
	        source;
     
      // load data from all sources
      for (var i = 0; i < this._sources.length; i++) {
    	  source = this._sources[i].source;
    	  source.load(handler);
      }
      
			function handler() {
				var source, border, renderer, context;
				
				count  += 1;
				if (count === that._sources.length) {
					// calcualte borders
					if (!that._borders) {
					  var b = {xmin: Number.MAX_VALUE, xmax: Number.MIN_VALUE, 
			  		         ymin: Number.MAX_VALUE, ymax: Number.MIN_VALUE};
						
						for (var i = 0; i < that._sources.length; i++) {
							source = that._sources[i].source;
							border = source.dataBorders();
							if (border.xmin < b.xmin) {
								b.xmin = border.xmin;
						  } if (border.xmax > b.xmax) {
								b.xmax = border.xmax;
						  } if (border.ymin < b.ymin) {
								b.ymin = border.ymin;
						  } if (border.ymax > b.ymax) {
								b.ymax = border.ymax;
						  }
						}
						  
						that._borders = b;
					}
					
				  // iterate over contexts and set global borders and clear context
		      for (var i in that._contexts) {
		      	if (that._contexts.hasOwnProperty(i)) {
		      		that._contexts[i].clear().options(that._borders);
		      	}
		      }
		      that._selcontext.clear().options(that._borders);

		      // iterate over sources and plot their data
		      for (var i = 0; i < that._sources.length; i++) {
		        source   = that._sources[i];
		        context  = that._contexts[source.context];
		        renderer = that._renderer[source.renderer];
		        renderer.render(context, source.source);
		        if (context.name() == that._default) {
		          renderer.render(that._selcontext, source.source);
		        }
		      }
				}
			}
    };

    /**
     * Plot only parts of the data.
     *
     * @param xmin {number}   The lower border.
     * @param xmax {number}   The upper border.
     */
    PlotManager.prototype.plotSlice = function(xmin, xmax) {
    	var count = 0, 
    	    that  = this,
    	    source;
      
      // load data from all sources
      for (var i = 0; i < this._sources.length; i++) {
    	  source = this._sources[i].source;
    	  source.slice(xmin, xmax, handler);
      }
      
			function handler() {
				var source, border, renderer, context;
				
				count  += 1;
				if (count === that._sources.length) {
					// calcualte borders
				  var b = {xmin: Number.MAX_VALUE, xmax: Number.MIN_VALUE, 
				  		     ymin: Number.MAX_VALUE, ymax: Number.MIN_VALUE};
						
					for (var i = 0; i < that._sources.length; i++) {
						source = that._sources[i].source;
						border = source.sliceBorders();
						if (border.xmin < b.xmin) {
							b.xmin = border.xmin;
					  } if (border.xmax > b.xmax) {
							b.xmax = border.xmax;
					  } if (border.ymin < b.ymin) {
							b.ymin = border.ymin;
					  } if (border.ymax > b.ymax) {
							b.ymax = border.ymax;
					  }
					}
					
				  // iterate over contexts and set global borders and clear context
		      for (var i in that._contexts) {
		      	if (that._contexts.hasOwnProperty(i)) {
		      		that._contexts[i].clear().options(b);
		      	}
		      }

		      // iterate over sources and plot their data
		      for (var i = 0; i < that._sources.length; i++) {
		        source   = that._sources[i];
		        context  = that._contexts[source.context];
		        renderer = that._renderer[source.renderer];
		        renderer.render(context, source.source, true);
		        if (context.name() == that._default) {
		          renderer.render(that._selcontext, source.source);
		        }
		      }
				}
			}
    };

    /**
     * Create a new context.
     *
     * @param name {string}     Name of the new context.
     * @param options {object}  Some options, see cry.Context for more details.
     */
    PlotManager.prototype.createContext = function(name, options) {
      if (name && !this._contexts[name]) {
        // calculate height for contexts and clear contexts
        var ncontext = 1;
        for (var i in this._contexts) {
          this._contexts[i].clear();
          ncontext += 1;
        }
        var height = (this._height - this._selconfig.height) / ncontext;
        // iterate over contexts and set height
        for (var i in this._contexts) { this._contexts[i].height(height); }

        // define context options
        var opt = options || {};

        // check if context is the default context
        if (!this._default || opt.isdefalt)
          this._default = name;

        // create new context
        opt.width  = this._width;
        opt.height = height;
        this._contexts[name] = new cry.Context(this._svg, name, opt);

        // position contexts
        var k = 0;
        for (var i in this._contexts) {
          this._contexts[i].svg().attr("transform", "translate(0," + (height * k) + ")");
          k += 1;
        }
      }
    };

    /**
     * Remove an existing context.
     * TODO: make also the default context removable
     *
     * @param name {string} The name of context to remove.
     */
    PlotManager.prototype.removeContext = function(name) {
      // find and remove contexts
      var removed = false; var ncontext = 0;
      for (var i in this._contexts) {
        if (this._contexts[i].name() == name) {
          this._contexts[i].svg().remove();
          delete this._contexts[i];
          removed = true;
        } else {
          ncontext += 1;
        }
      }
      if (removed) {
        // remove also all sources connected to the context
        var i = 0;
        while (i < this._sources.length) {
          if (this._sources[i].context == name) {
            this._sources.splice(i, 1);
          } else {
            i += 1;
          }
        }

        // calculate height for each remaining context
        var height = (this._height - this._selconfig.height) / ncontext;
        // iterate over contexts and set height
        var k = 0;
        for (var i in this._contexts) {
          this._contexts[i].height(height);
          this._contexts[i].svg().attr("transform", "translate(0," + (height * k) + ")");
          k += 1;
        }
      }
    };

    /**
     * Add a new renderer to the plot manager.
     *
     * @param name {string}       The name of the renderer.
     * @param renderer {Renderer} The renderer object.
     */
    PlotManager.prototype.addRenderer = function(name, renderer) {
      if (name && !this._renderer[name]) {
        this._renderer[name] = renderer;
      }
    };

    /**
     * Remove a renderer from the plot manager.
     *
     * @param name {string}   The name of the renderer to remove
     */
    PlotManager.prototype.removeRenderer = function(name) {
      if (this._renderer.hasOwnProperty(name)) {

        delete this._renderer[name];

        // remove also all sources connected to the renderer
        var i = 0;
        while (i < this._sources.length) {
          if (this._sources[i].renderer == name) {
            this._sources.splice(i, 1);
          } else {
            i += 1;
          }
        }
      }
    };

    /**
     * Add a new source to the manager.
     *
     * @param source {Source}   The source to add.
     * @param context {string}  The name of the context on which to draw the data from the source.
     * @param renderer {string} The name of the renderer to use for the data.
     */
    PlotManager.prototype.addSource = function(source, context, renderer) {
      if (this._contexts[context] && this._renderer[renderer]) {
        this._borders = null;
        this._sources.push({context: context, renderer: renderer, source: source});
      }
    };

    /**
     * Remove a source from the manager.
     *
     * @param name {string}   The name of the source to remove.
     */
    PlotManager.prototype.removeSource = function(name) {
      var i = 0;
      while (i < this._sources.length) {
        if (this._sources[i].source.name() == name) {
          this._sources.splice(i, 1);
        } else {
          i += 1;
        }
      }
    };

    /**
     * Creates a hander for selection events of a context.
     *
     * @returns {Function}  A select handler.
     */
    PlotManager.prototype._onselect = function() {
      if (!this._onselectHandler) {
        var that = this;
        this._onselectHandler = function(xmin, xmax) {
          that.plotSlice(xmin, xmax);
        };
      }
      return this._onselectHandler;
    };

    return PlotManager;
  })();

})(cry || (cry = {}), d3, jQuery); // end module cry

