// ---------- file: cry/context.js ---------- //

// Augment module 'cry' and import d3 locally
var cry;
(function (cry, d3) {
    "use strict";

    /*******************************************************************************
     * Class cry.Context.
     * A context can be used by a renderer to draw a plot.
     *
     * @returns {Function} Constructor for Context.
     ******************************************************************************/
    cry.Context = (function () {

        /**
         * Constructor of the class cry.Context.
         * A context can be used by a renderer to draw a plot.
         *
         * @param parent    The parent svg element (D3).
         * @param name      The name of the context.
         * @param opt       Other options for the context: width, height, xmin, xmax,
         *                  padd, xticks, yticks, onselect.
         */
        function Context(parent, name, opt) {
            var opt = opt || {};
            // initialize d3 handle for svg
            this._svg = parent.append('g');
            this._svg.attr('class', 'context')
                .attr('id', name);
            this._name = name;
            // initialize private members
            this._width = Math.round(opt.width || parent.attr('width'));
            this._height = Math.round(opt.height || parent.attr('height'));
            this._padd = _adjustUp(opt.padd || 20);
            this._xmin = _adjustDown(opt.xmin || 0);
            this._xmax = _adjustUp(opt.xmax || this._width - ((this._padd * 2) + 10));
            this._ymin = _adjustDown(opt.ymin || 0);
            this._ymax = _adjustUp(opt.ymax || this._height - (this._padd * 2));
            this._xticks = (opt.xticks != undefined) ? Math.round(opt.xticks) : 10;
            this._yticks = (opt.yticks != undefined) ? Math.round(opt.yticks) : 5;
            // initialize scales using d3
            this._xScale = d3.scale.linear();
            this._xScale.domain([this._xmin, this._xmax])
                .range([this._padd + 10, this._width - this._padd]);
            this._yScale = d3.scale.linear();
            this._yScale.domain([this._ymin, this._ymax])
                .range([this._height - this._padd, this._padd]);
            // initialize x-axis using d3
            this._xAxis = d3.svg.axis();
            this._xAxis.scale(this._xScale)
                .orient('bottom')
                .ticks(this._xticks);
            this._xAxisSVG = this._svg.append("g");
            this._xAxisSVG.attr("transform", "translate(0," + (this._height - this._padd) + ")")
                .attr("class", "axis").call(this._xAxis);
            // initialize y-axis using d3
            this._yAxis = d3.svg.axis();
            this._yAxis.scale(this._yScale)
                .orient('left')
                .ticks(this._yticks);
            this._yAxisSVG = this._svg.append("g");
            this._yAxisSVG.attr("transform", "translate(" + (this._padd + 10) + ",0)")
                .attr("class", "axis").call(this._yAxis);
            // create a defs element
            this._defs = this._svg.selectAll('defs');
            if (this._defs.empty())
                this._defs = this._svg.append('defs');
            // init selection
            this._onselect = opt.onselect;
            this.initSelection();
        }

        /**
         * Getter for the svg element that represents the context.
         *
         * @returns {d3} The svg element representing the context.
         */
        Context.prototype.svg = function () {
            return this._svg;
        };

        /**
         * Getter for the defs element in the context.
         *
         * @returns {d3} The defs element of the context.
         */
        Context.prototype.defs = function () {
            return this._defs;
        };

        /**
         * Getter for the name of the context.
         *
         * @returns {string} The name of the context.
         */
        Context.prototype.name = function () {
            return this._name;
        };

        /**
         * Getter/setter for the xmin value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param xmin  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.xmin = function (xmin) {
            if (xmin !== undefined) {
                this._xmin = _adjustDown(xmin);
                this.redraw();
                return this;
            }
            return this._xmin;
        };

        /**
         * Getter/setter for the xmax value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param xmax  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.xmax = function (xmax) {
            if (xmax !== undefined) {
                this._xmax = _adjustUp(xmax);
                this.redraw();
                return this;
            }
            return this._xmax;
        };

        /**
         * Getter/setter for the ymin value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param ymin  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.ymin = function (ymin) {
            if (ymin !== undefined) {
                this._ymin = _adjustDown(ymin);
                this.redraw();
                return this;
            }
            return this._ymin;
        };

        /**
         * Getter/setter for the ymax value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param ymax  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.ymax = function (ymax) {
            if (ymax !== undefined) {
                this._ymax = _adjustUp(ymax);
                this.redraw();
                return this;
            }
            return this._ymax;
        };

        /**
         * Getter/setter for the xticks value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param xticks  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.xticks = function (xticks) {
            if (xticks !== undefined) {
                this._xticks = Math.round(xticks);
                this.redraw();
                return this;
            }
            return this._xticks;
        };

        /**
         * Getter/setter for the ytics value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param yticks  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.yticks = function (yticks) {
            if (yticks !== undefined) {
                this._yticks = Math.round(yticks);
                this.redraw();
                return this;
            }
            return this._yticks;
        };

        /**
         * Getter/setter for the width value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param width  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.width = function (width) {
            if (width !== undefined) {
                this._width = Math.round(width);
                this.redraw();
                return this;
            }
            return this._width;
        };

        /**
         * Getter/setter for the height value.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param height  {string}    The new value.
         *
         * @returns {string|Context} The value (getter) or the context itself (setter).
         */
        Context.prototype.height = function (height) {
            if (height !== undefined) {
                this._height = Math.round(height);
                this.redraw();
                return this;
            }
            return this._height;
        };

        /**
         * Getter/setter for the 'onselect' callback. If this handler is specified
         * the the context will provide a selection brush. Each time the selection changes
         * the callback will be invoked with the selected range as parameters.
         * If uses as setter it returns the context, this provides the possibility
         * of method chaining.
         *
         * @param onselect  {Function}    The new value.
         *
         * @returns {Context|Function} The value (getter) or the context itself (setter).
         */
        Context.prototype.onselect = function (onselect) {
            if (onselect !== undefined) {
                this._onselect = onselect;
                this.redraw();
                return this;
            }
            return this._onselect;
        };

        /**
         * Set multiple options.
         *
         * @param opt {Object}    An option object.
         *
         * @returns {Context} The context.
         */
        Context.prototype.options = function (opt) {
            if (opt) {
                if (opt.hasOwnProperty('width'))
                    this._width = Math.round(opt.width);
                if (opt.hasOwnProperty('height'))
                    this._height = Math.round(opt.height);
                if (opt.hasOwnProperty('xmin'))
                    this._xmin = _adjustDown(opt.xmin);
                if (opt.hasOwnProperty('xmax'))
                    this._xmax = _adjustUp(opt.xmax);
                if (opt.hasOwnProperty('ymin'))
                    this._ymin = _adjustDown(opt.ymin);
                if (opt.hasOwnProperty('ymax'))
                    this._ymax = _adjustUp(opt.ymax);
                if (opt.hasOwnProperty('xticks'))
                    this._xticks = Math.round(opt.xticks);
                if (opt.hasOwnProperty('yticks'))
                    this._yticks = Math.round(opt.yticks);
                this.redraw();
            }
            return this;
        };

        /**
         * Calculate x values in pixels from the real data.
         *
         * @param val {number} The value to turn into a pixel.
         *
         * @returns {number} The calculated pixels.
         */
        Context.prototype.xScale = function (val) {
            return this._xScale(val);
        };

        /**
         * Calculate y values in pixels from the real data.
         *
         * @param val {number} The value to turn into a pixel.
         *
         * @returns {number} The calculated pixels.
         */
        Context.prototype.yScale = function (val) {
            return this._yScale(val);
        };

        /**
         * Removes all plots from this context.
         *
         * @returns {Context} The context.
         */
        Context.prototype.clear = function () {
            this._svg.selectAll('.plot').remove();
            return this;
        };

        /**
         * Redraw the axis and the selection brush.
         *
         * @returns {Context} The context.
         */
        Context.prototype.redraw = function () {
            this._xScale.domain([this._xmin, this._xmax])
                .range([this._padd + 10, this._width - this._padd]);
            this._yScale.domain([this._ymin, this._ymax])
                .range([this._height - this._padd, this._padd]);

            this._xAxis.scale(this._xScale).ticks(this._xticks);
            this._xAxisSVG.attr("transform", "translate(0," + (this._height - this._padd) + ")")
                .call(this._xAxis);

            this._yAxis.scale(this._yScale).ticks(this._yticks);
            this._yAxisSVG.attr("transform", "translate(" + (this._padd + 10) + ",0)")
                .call(this._yAxis);

            this.initSelection();
            return this;
        };

        /**
         * Initialize or remove the selection brush depending on the existance of the
         * onselect callback.
         *
         * @returns {Context} The context.
         */
        Context.prototype.initSelection = function () {
            if (this._onselect) {
                if (!this._brush)
                    this._brush = d3.svg.brush();
                this._svg.attr('class', 'context brush').attr('style', 'pointer-events: all;');
                this._brush = d3.svg.brush();
                this._brush.x(this._xScale).on('brushend', this.onBrush());
                this._svg.call(this._brush);
                this._svg.selectAll('.background, .extent, .resize rect')
                    .attr("y", this._padd)
                    .attr("height", this._height - (2 * this._padd));
            } else {
                if (this._brush) {
                    this._brush.on('brushend', null);
                    this._brush = undefined;
                    this._svg.attr('class', 'context').attr('style', '');
                    this._svg.selectAll('.background, .extent, .resize rect').remove();
                }
            }
        };

        /**
         * Create a handler for brush events.
         * It checks if the selection has changed an invokes the onselect callback.
         *
         * @returns {Function} A handler for brush events.
         */
        Context.prototype.onBrush = function () {
            var that = this;
            var last = [this.xmin(), this.xmax()];
            return function () {
                var act = that.onselect();
                var ext = that._brush.extent();
                var x1pix = that.xScale(ext[0]);
                var x2pix = that.xScale(ext[1]);
                var diff = x2pix - x1pix;
                if (diff < 1) {
                    ext[0] = that.xmin();
                    ext[1] = that.xmax();
                }
                if (typeof (act) == 'function' && (ext[0] != last[0] || ext[1] != last[1])) {
                    act(ext[0], ext[1]);
                    last = ext;
                }
            };
        };

        /**
         * Adjust values.
         *
         * @param val {number} The value to adjust.
         *
         * @return {number} The adjusted value.
         */
        function _adjustUp(val) {
            var x = val;
            if (Math.abs(x) > 0) {
                x = Math.ceil(x);
            }
            return x;
        }

        /**
         * Adjust values.
         *
         * @param val {number} The value to adjust.
         *
         * @return {number} The adjusted value.
         */
        function _adjustDown(val) {
            var x = val;
            if (Math.abs(x) > 0) {
                x = Math.floor(x);
            }
            return x;
        }

        return Context;
    })(); // end class context

})(cry || (cry = {}), d3); // end module cry

