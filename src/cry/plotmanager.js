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

    /**
     * Plot only parts of the data.
     *
     * @param xmin {number}   The lower border.
     * @param xmax {number}   The upper border.
     */
    PlotManager.prototype.plotSlice = function(xmin, xmax) {
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
      conf.xmin = xmin; conf.xmax = xmax;

      /// iterate over contexts and set global borders and clear context
      for (var i in this._contexts) {
        this._contexts[i].clear().options(conf);
      }

      // request sliced data from source.
      // when done each source creates a slice event which triggers a plot handler.
      for (var i in this._sources) {
        this._sources[i].source.slice(xmin, xmax, this._sliceNotify());
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

    /**
     * Creates a handler that can be passed to the slice() method of a source. It produces
     * an slice event on the message bus.
     *
     * @returns {Function} A handler that produces slice events.
     */
    PlotManager.prototype._sliceNotify = function() {
      if (!this._sliceNotifyHandler) {
        var that = this;
        this._sliceNotifyHandler = function(source) {
          that._bus.publish('slice', source);
        };
      }
      return this._sliceNotifyHandler;
    };

    /**
     * Creates a handler for slice events. If this handler recieves an event, it will arrange for all
     * configured renderers to draw the data to the respective context.
     *
     * @returns {Function} A handler for slice events.
     */
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
   * @returns {Function}
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

