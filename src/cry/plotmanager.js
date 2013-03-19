// ---------- file: cry/plotmanager.js ---------- //

// Augment the module cry and import d3 locally.
var cry; (function(cry, d3) {
  "use strict";

  /*******************************************************************************
   * Class PlotManager.
   * Source for random analog signals, that can be used as test data.
   *
   * @returns {Function} Constructor for PlotManager
   ******************************************************************************/
  cry.PlotManager = (function() {

    /**
     * Constructor of the class PlotManager.
     *
     * @param svg   An svg elements as d3 selection.
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
    }

    /**
     * Plot all data from all sources using the configured renderer and context.
     */
    PlotManager.prototype.plot = function() {
      var conf = {xmin: 0, xmax: 0, ymin: 0, ymax: 0};
      var source, context, border, renderer;
      // iterate over sources to calculate global borders
      for (var i in this._sources) {
        source = this._sources[i].source;
        border = source.borders();
        if (border.xmin < conf.xmin)
          conf.xmin = border.xmin;
        if (border.xmax > conf.xmax)
          conf.xmax = border.xmax;
        if (border.ymin < conf.ymin)
          conf.ymin = border.ymin;
        if (border.ymax > conf.ymax)
          conf.ymax = border.ymax;
      }
      /// iterate over contexts and set global borders
      for (var i in this._contexts) {
        this._contexts[i].options(conf);
      }
      // call clear on all renderer
      for (var i in this._renderer) { this._renderer[i].clear(); }
      // iterate over sources and plot their data
      for (var i in this._sources) {
        source   = this._sources[i];
        context  = this._contexts[source.context];
        renderer = this._renderer[source.renderer];
        renderer.render(context, source.source);
      }
    };

    /**
     * Create a new context.
     *
     * @param name      Name of the new context.
     * @param options   Some options, see cry.Context for more details.
     */
    PlotManager.prototype.createContext = function(name, options) {
      if (name && !this._contexts[name]) {
        // call clear on all renderer
        for (var i in this._renderer) { this._renderer[i].clear(); }
        // calculate height for contexts
        var ncontext = 1;
        for (var i in this._contexts) { ncontext += 1; }
        var height = this._height / ncontext;
        // iterate over contexts and set height
        for (var i in this._contexts) { this._contexts[i].height(height); }
        // create new context
        var opt = options || {};
        opt.width = this._width;
        opt.height = height;
        this._contexts[name] = new cry.Context(this._svg, name, opt);
        // function for context translation
        var translate = function(cont, k) {
          return "translate(0," + height * k + ")";
        };
        // position contexts
        this._svg.selectAll('.context').attr("transform", translate);
      }
    };

    /**
     * Add a new renderer to the plot manager.
     *
     * @param name      The name of the renderer.
     * @param renderer  The renderer object.
     */
    PlotManager.prototype.addRenderer = function(name, renderer) {
      if (name && !this._renderer[name]) {
        this._renderer[name] = renderer;
      }
    };

    /**
     * Add a new source to the manager.
     *
     * @param source    The source to add.
     * @param context   Context on which to draw the date from the source.
     * @param renderer  The renderer to use for this source.
     */
    PlotManager.prototype.addSource = function(source, context, renderer) {
      if (this._contexts[context] && this._renderer[renderer]) {
        this._sources.push({context: context, renderer: renderer, source: source});
      }
    };

    return PlotManager;
  })();

})(cry || (cry = {}), d3); // end module cry

