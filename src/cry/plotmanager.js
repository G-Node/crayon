// ---------- file: cry/plotmanager.js ---------- //

// Augment the module cry and import d3 locally.
var cry; (function(cry, d3, $) {
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
      // crate a message bus and register render handlers
      this._bus = new CryBus();
      this._bus.subscribe('slice', this._renderOnSlice());
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
      var conf, source, context, border, renderer;

      // calculate borders
      if (this._borders) {
        // borders are still valid, copy them
        conf = $.extend(true, {}, this._borders);
      } else {
        // iterate over sources to calculate global borders
        conf = {xmin: 0, xmax: 0, ymin: 0, ymax: 0};
        for (var i in this._sources) {
          source = this._sources[i].source;
          border = source.dataBorders();
          if (border.xmin < conf.xmin)
            conf.xmin = border.xmin;
          if (border.xmax > conf.xmax)
            conf.xmax = border.xmax;
          if (border.ymin < conf.ymin)
            conf.ymin = border.ymin;
          if (border.ymax > conf.ymax)
            conf.ymax = border.ymax;
        }
        this._borders = $.extend(true, {}, conf);
      }

      /// iterate over contexts and set global borders and clear context
      for (var i in this._contexts) {
        this._contexts[i].clear().options(this._borders);
      }
      this._selcontext.clear().options(this._borders);

      // iterate over sources and plot their data
      for (var i in this._sources) {
        source   = this._sources[i];
        context  = this._contexts[source.context];
        renderer = this._renderer[source.renderer];
        renderer.render(context, source.source);
        if (context.name() == this._default) {
          renderer.render(this._selcontext, source.source);
        }
      }
    };

    PlotManager.prototype.plotSlice = function(x1, x2) {
      var conf, source, border;

      // calculate borders
      if (this._borders) {
        // borders are still valid, copy them
        conf = $.extend(true, {}, this._borders);
      } else {
        // iterate over sources to calculate global borders
        conf = {xmin: 0, xmax: 0, ymin: 0, ymax: 0};
        for (var i in this._sources) {
          source = this._sources[i].source;
          border = source.dataBorders();
          if (border.xmin < conf.xmin)
            conf.xmin = border.xmin;
          if (border.xmax > conf.xmax)
            conf.xmax = border.xmax;
          if (border.ymin < conf.ymin)
            conf.ymin = border.ymin;
          if (border.ymax > conf.ymax)
            conf.ymax = border.ymax;
        }
        this._borders = $.extend(true, {}, conf);
      }
      conf.xmin = x1; conf.xmax = x2;

      /// iterate over contexts and set global borders and clear context
      for (var i in this._contexts) {
        this._contexts[i].clear().options(conf);
      }
      //this._selcontext.clear().options(this._borders);

      // request sliced data from source
      for (var i in this._sources) {
        this._sources[i].source.slice(x1, x2, this._sliceNotify());
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
        // calculate height for contexts and clear contexts
        var ncontext = 1;
        for (var i in this._contexts) {
          this._contexts[i].clear();
          ncontext += 1;
        }
        var height = (this._height-this._selconfig.height) / ncontext;
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
        this._borders = null;
        this._sources.push({context: context, renderer: renderer, source: source});
      }
    };


    PlotManager.prototype._onselect = function() {
      if (!this._onselectHandler) {
        var that = this;
        this._onselectHandler = function(x1, x2) {
          that.plotSlice(x1, x2);
        };
      }
      return this._onselectHandler;
    };

    PlotManager.prototype._sliceNotify = function() {
      if (!this._sliceNotifyHandler) {
        var that = this;
        this._sliceNotifyHandler = function(source) {
          that._bus.publish('slice', source);
        };
      }
      return this._sliceNotifyHandler;
    };

    PlotManager.prototype._renderOnSlice = function() {
      var that = this;
      return function(event, source) {
        // iterate over sources and plot all data
        for (var i in that._sources) {
          var sconf = that._sources[i];
          var name  = sconf.source.name();
          if (name == source.name()) {
            var context  = that._contexts[sconf.context];
            var renderer = that._renderer[sconf.renderer];
            renderer.render(context, source, true);
          }
        }
      };
    };

    return PlotManager;
  })();

  /*******************************************************************************
   * A private bus class that is used internally for messaging.
   *
   * @returns {CryBus}
   ******************************************************************************/
   var CryBus = (function() {

    /**
     * Constructor for a private bus class.
     *
     * @constructor
     * @this {CryBus}
     */
    function CryBus() {
      this.onerror = function(event, data) {
        if (data && data.error && console) {
          console.log('CryBus (ERROR): event = ' + event + ' // error' + data.response || data.error);
          return false;
        }
        return true;
      };
    }

    /**
     * Subscribe a function to a specific event.
     *
     * @param event {string}    The event name.
     * @param fn {Function}     The function to call when events are published.
     *
     * @return {CryBus} The event bus.
     */
    CryBus.prototype.subscribe = function(event, fn) {
      if (cry.debug && console)
        console.log('CryBus (DEBUG): subscribe event ' + event);
      $(this).bind(event, fn);
      return this;
    };

    /**
     * Unsubscribe a specific event.
     *
     * @param event {string}    The event name.
     *
     * @return {CryBus} The event bus.
     */
    CryBus.prototype.unsubscribe = function(event) {
      if (cry.debug && console)
        console.log('CryBus (DEBUG): unsubscribe event ' + event);
      $(this).unbind(event);
      return this;
    };

    /**
     * Fire a specific event.
     *
     * @param event {string}    The event name.
     * @param data {Object}     The data that will be passed to the event handler function
     *                          along with the event.
     *
     * @return {CryBus} The event bus.
     */
    CryBus.prototype.publish = function(event, data) {
      if (this.onerror(event, data)) {
        if (cry.debug && console) {
          var d = data || 'none';
          console.log('CryBus (DEBUG): publish event ' + event + ' // data = ' + d);
        }
        $(this).trigger(event, data);
      } else if (console) {
        var d = data || 'none';
        console.log('CryBus (DEBUG): event not published due to errors // data = ' + d);
      }
      return this;
    };

    return CryBus;
  })();

})(cry || (cry = {}), d3, jQuery); // end module cry

