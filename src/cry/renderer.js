// ---------- file: cry/renderer.js ---------- //


// Augment module 'cry'
var cry;
(function (cry) {
    "use strict";

    /*******************************************************************************
     * Class cry.Renderer.
     * This is just a base implementation without real rendering funcionality, that
     * serves as super class for other renderers.
     *
     * @returns {Function} Constructor for Renderer.
     ******************************************************************************/
    cry.Renderer = (function () {

        /**
         * Constructor of the class Renderer.
         *
         * @constructor @this Renderer
         *
         * @param type {string}   A type name for the renderer e.g. signal, spike or event.
         */
        function Renderer(type) {
            this._class = 'renderer-' + (Math.random() * Math.pow(2, 32)).toString(32);
            this._classes = ['plot', type, this._class].join(' ');
            this._contexts = {};
        }

        /**
         * Clear all plots from all contexts.
         */
        Renderer.prototype.clear = function () {
            for (var i in this._contexts) {
                if (this._contexts.hasOwnProperty(i)) {
                    var context = this._contexts[i];
                    context.svg().selectAll('.' + this._class).remove();
                }
            }
        };

        /**
         * Draw plots on contexts.
         *
         * @param context {Context} The context to draw on.
         * @param sources {Source}   The data source.
         * @param [sliced] {Boolean}  If true, render sliced data.
         */
        Renderer.prototype.render = function (context, sources, sliced) {
            this._contexts[context.name()] = context;
            // this is just a stub
        };

        return Renderer;
    })(); // end class renderer

    /*******************************************************************************
     * Class cry.SingnalRenderer.
     * A renderer for drawing analog signals
     *
     * @returns {Function} Constructor for SignalRenderer
     ******************************************************************************/
    cry.SignalRenderer = (function () {

        /**
         * Constructor for the class SignalRenderer.
         *
         * @constructor @this SignalRenderer
         */
        SignalRenderer.inherits(cry.Renderer);
        function SignalRenderer() {
            SignalRenderer.parent.constructor.call(this, 'signal');
        }

        /**
         * Draw analog signals using the data from the specified source.
         *
         * @param context {Context}         The context to draw on.
         * @param sources Array.{Source]    The source providing the data for the plot.
         * @param [sliced] {Boolean}        Plot sliced data (optional).
         *
         * @public
         */
        SignalRenderer.prototype.render = function (context, sources, sliced) {

            var alldata = [],
                data, plot, style;

            // remember this context
            this._contexts[context.name()] = context;

            // collect data from sources
            if (sliced) {
                for (var i = 0; i < sources.length; i++) {
                    alldata = alldata.concat(sources[i].sliced());
                }
            } else {
                for (i = 0; i < sources.length; i++) {
                    alldata = alldata.concat(sources[i].data());
                }
            }

            if (alldata.length > 0) {
                for (i = 0; i < alldata.length; i += 1) {
                    data = alldata[i].data;
                    style = alldata[i].style;
                    if (!style)
                        style = 'stroke:black';
                    plot = context.svg().append('path')
                        .attr('class', this._classes)
                        .attr('style', style);

                    var d = new Array(data.length), x, y;
                    for (var j = 1; j < data.length; j += 2) {
                        x = context.xScale(data[j - 1]);
                        y = context.yScale(data[j]);
                        if (j == 1) {
                            d[0] = "M" + x.toFixed(1);
                            d[1] = y.toFixed(1);
                        } else {
                            d[j - 1] = "L" + x.toFixed(1);
                            d[j] = y.toFixed(1);
                        }
                    }
                    d = d.join(' ');
                    plot.attr('d', d);
                }
            }
        };

        return SignalRenderer;
    })(); // end class SignalRenderer


    /*******************************************************************************
     * Class SpikeRenderer.
     * A renderer for drawing spike trains.
     *
     * @returns {Function} Constructor for SpikeRenderer
     ******************************************************************************/
    cry.SpikeRenderer = (function () {

        /**
         * Constructor for the class Spike renderer.
         *
         * @constructor @this SpikeRenderer
         */
        SpikeRenderer.inherits(cry.Renderer);
        function SpikeRenderer() {
            SpikeRenderer.parent.constructor.call(this, 'spike');
        }

        /**
         * Draw spiketrains using the given context and data source.
         *
         * @param context {Context}         The context to draw on.
         * @param sources Array.{Source}    The source providing the data for the plot.
         * @param [sliced] {Boolean}        Plot sliced data (optional).
         */
        SpikeRenderer.prototype.render = function (context, sources, sliced) {

            var alldata = [],
                data, plot;

            // remember this context
            this._contexts[context.name()] = context;

            // collect data from sources
            if (sliced) {
                for (var i = 0; i < sources.length; i++) {
                    alldata = alldata.concat(sources[i].sliced());
                }
            } else {
                for (i = 0; i < sources.length; i++) {
                    alldata = alldata.concat(sources[i].data());
                }
            }

            context.defs().selectAll('.' + this._class).remove();

            if (alldata.length > 0) {

                var yrange = context.ymax() - context.ymin();
                var ystep = yrange / alldata.length;
                var markheight = (context.height() / alldata.length) * 0.8;

                for (i = 0; i < alldata.length; i += 1) {
                    data = alldata[i].data;

                    // create marker
                    SpikeRenderer.addMarker(context.defs(), 'spikemarker-' + i, markheight, alldata[i].style);

                    // create path
                    plot = context.svg().append('path')
                        .attr('class', this._classes)
                        .attr('marker-mid', 'url(#spikemarker-' + i + ')');

                    var d = new Array(data.length), x, y;
                    for (var j = 1; j < data.length; j += 2) {
                        x = context.xScale(data[j - 1]);
                        y = context.yScale(context.ymin() + (ystep * i));
                        if (j == 1) {
                            d[0] = "M" + x.toFixed(1);
                            d[1] = y.toFixed(1);
                        } else {
                            d[j - 1] = "L" + x.toFixed(1);
                            d[j] = y.toFixed(1);
                        }
                    }
                    d = d.join(' ');
                    plot.attr('d', d);
                }
            }
        };

        /**
         * Add a marker for a spiketrain to the defs of a context.
         *
         * @param defs    The defs element of the context.
         * @param name    The name of the marker.
         * @param height  Height of the marker.
         * @param style   The style to apply on the marker.
         */
        SpikeRenderer.addMarker = function (defs, name, height, style) {
            var sty = style;
            if (!sty)
                sty = 'stroke:black;stroke-opacity:0.8';
            defs.append('marker')
                .attr('id', name)
                .attr('markerWidth', 1).attr('markerHeight', height * -1)
                .append('line')
                .attr('stroke-width', 1).attr('fill', 'none')
                .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', height * -1)
                .attr('style', sty);
        };


        return SpikeRenderer;
    })(); // end class SpikeRenderer

})(cry || (cry = {})); // end module cry

