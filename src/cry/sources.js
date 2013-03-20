// ---------- file: cry/renderer.js ---------- //


// Augment module 'cry'
var cry; (function(cry) {
  "use strict";

  /*******************************************************************************
   * Class cry.Source.
   * A source provides data used that can be plotted by a renderer. A source returns
   * data as array of objects with te following structure:
   *
   * [
   *  {data: array, style: string, name: string},
   *  ...
   * ]
   *
   * The data field contains a 1d-array with x and y values. [x1, y1, x2, y2, ..., xn, yn].
   * The style string provides a valid value for the SVG style attribute (optional).
   * The name string might or might not be used by a renderer to  label the plot (optional).
   *
   * @returns {Source} Constructor for a Source
   ******************************************************************************/
  cry.Source = (function() {

    /**
     * Constructor for the class source.
     *
     * @constructor
     * @this {Source}
     * @param num {number}    Number of data in this source (optional).
     */
    function Source(num) {
      var num = num || 0;
      this._data   = new Array(num);
      this._sliced = new Array(num);
      this._dataReady   = false;
      this._slicedReady = false;
    }

    /**
     * Load data into the source.
     *
     * @param callback {Function} A callback that is invoked when loading is done.
     */
    Source.prototype.load = function(callback) {
      // implement this in subclass
      console.log("Source.load(): unimplemented method.");
    };

    /**
     * Return all data of this source - if data are available.
     *
     * @returns {Array} An array of data objects.
     */
    Source.prototype.data = function() {
      if (this._dataReady) {
        return this._data;
      }
      throw "Source: no data available. Use hasData() to avoid this error.";
    };

    /**
     * Calculates the borders for all data.
     *
     * @returns {{xmin, xmax, ymin, ymax}} An object containing all min and max values.
     */
    Source.prototype.dataBorders = function() {
      if (this._dataReady) {
        return _borders(this._data);
      }
      throw "Source: no data available. Use hasData() to avoid this error.";
    };


    /**
     * Check for data.
     *
     * @returns {Boolean} True if data are available, false otherwise.
     */
    Source.prototype.hasData = function() {
      return this._dataReady;
    };

    /**
     * Slice data and invoke callback when done.
     *
     * @param start {number}      The start of the slice.
     * @param end {number}       The end of the slice.
     * @param callback {Function} A callback that is invoked when the sliced data
     *                            are available.
     */
    Source.prototype.slice = function(start, end, callback) {
      if (this._dataReady) {
        this._slicedReady = false;
        // set defaults for start and end
        var border = this.dataBorders();
        var start = start || border.xmin;
        var end   = end   || border.xmax;
        // prepare array
        delete this._sliced;
        this._sliced = new Array(this._data.length);
        // make slice
        var d, s, startpos, endpos;
        for (var i = 0; i < this._data.length; i += 1) {

          d = this._data[i];
          s = {style: d.style, name: d.name};
          startpos = 0; endpos = d.data.length - 1;

          for (var j = 0; j < d.data.length - 1; j += 2) {
            if (d.data[j] <= start) {
              startpos = j;
            } else if (d.data[j] > end) {
              endpos = j;
              break;
            }
          }

          if (d.data instanceof ArrayBufferView) { // typed arrray
            s.data = d.data.subarray(startpos, endpos);
          } else {                                 // normal array
            s.data = d.data.slice(startpos, endpos);
          }

          this._sliced[i] = s;
        }

        this._slicedReady = true;
        if (typeof(callback) == 'function')
          callback(this);
      } else {
        throw "Source: no data available. Use hasData() to avoid this error.";
      }
    };

    /**
     * Return all sliced data of this source - if such data are available.
     * The method will throw an error if the slicing is not done and the requested
     * data are not available.
     *
     * @returns {Array} The sliced data of this source.
     */
    Source.prototype.sliced = function() {
      if (this._slicedReady) {
        return this._sliced;
      }
      throw "Source: no sliced data available. Use hasSliced() to avoid this error.";
    };


    /**
     * Calculates the borders for sliced data.
     *
     * @returns {{xmin, xmax, ymin, ymax}} An object containing all min and max values.
     */
    Source.prototype.sliceBorders = function() {
      if (this._slicedReady) {
        return _borders(this._sliced);
      }
      throw "Source: no sliced data available. Use hasSliced() to avoid this error.";
    };

    /**
     * Check for sliced data.
     *
     * @returns {Boolean} True if sliced data are available, false otherwise.
     */
    Source.prototype.hasSliced = function() {
      return this._slicedReady;
    };

    /**
     * Calculate the min and max values of an array of data objects.
     * For internal use only.
     *
     * @param data {Array}    Array of data objects.
     *
     *  @returns {{xmin, xmax, ymin, ymax}} An object containing all min and max values.
     */
    function _borders(data) {
      var border = {xmin : 0, xmax : 0, ymin : 0, ymax : 0};

      for (var i = 0; i < data.length; i += 1) {

        var d = data[i].data;

        for (var j = 1; j < d.length; j += 2) {
          var x = d[j - 1], y = d[j];

          if (x < border.xmin)
            border.xmin = x;
          else if (x > border.xmax)
            border.xmax = x;

          if (y < border.ymin)
            border.ymin = y;
          else if (y > border.ymax)
            border.ymax = y;
        }
      }
      return border;
    }

    return Source;
  })(); // end class Source

  /*******************************************************************************
   * Class cry.RandomSignal.
   * Source for random analog signals, that can be used as test data.
   *
   * @returns {Function} Constructor for RandomSignal
   ******************************************************************************/
  cry.RandomSignal = (function() {

    /**
     * Constructor for the class RandomSignal.
     *
     * @constructor
     * @extends {Source} @this {RandomSignal}
     *
     * @param xmax    The maximum x value.
     * @param ymax    The maximum y value.
     * @param size    The number of data points per signal.
     * @param num     The number of signals.
     */
    RandomSignal.inherits(cry.Source);
    function RandomSignal(xmax, ymax, size, num) {
      this._dataReady   = false;
      this._slicedReady = false;
      this._xmax = xmax || 100;
      this._ymax = ymax || 1000;
      this._size = size || 1000;
      this._num  = num  || 1;
    }

    /**
     * Load data into the source.
     *
     * @param callback {Function} A callback that is invoked when loading is done.
     */
    RandomSignal.prototype.load = function(callback) {
      this._data = new Array(this._num);
      for ( var i = 0; i < this._num; i += 1) {
        var s = _randStyle();
        var d = new Float32Array(this._size * 2);
        var x = 0;
        var y;
        var xstep = this._xmax / this._size;

        var a1 = this._ymax,
            phi1 = (Math.random() * Math.PI),
            o1 = Math.PI * ((Math.random() * 5 + 5) / this._xmax);
        var a2 = (Math.random() * this._ymax / 5),
            phi2 = (Math.random() * Math.PI),
            o2 = Math.PI * ((Math.random() * 50 + 50) / this._xmax);
        for ( var j = 1; j < this._size * 2; j += 2) {
          y = Math.sin(x * o1 + phi1) * a1 + Math.sin(x * o2 + phi2) * a2;
          d[j - 1] = x;
          d[j] = y;
          x += xstep;
        }
        this._data[i] = {data : d, style : s};
      }
      this._dataReady = true;
      if (typeof(callback) == 'function')
        callback(this);
    };

    /**
     * Random style for the signal data.
     * Private function for internal use only.
     *
     * @returns A string with style information.
     */
    function _randStyle() {
      var rand256 = function() {
        return Math.round(Math.random() * 255);
      };
      return 'stroke:rgb(' + rand256() + ',' + rand256() + ',' + rand256() + ')';
    }

    return RandomSignal;
  })(); // end class RandomSignal


  /*******************************************************************************
   * Class cry.RandomSpikes.
   * Source for random spike trains, that can be used as test data.
   *
   * @returns {RandomSpikes} Constructor for RandomSpikes
   ******************************************************************************/
  cry.RandomSpikes = (function() {

    /**
     * Constructor for the class RandomSpikes.
     *
     * @constructor
     * @extends {Source} @this {RandomSpikes}
     *
     * @param xmax    The maximum x value.
     * @param size    The number of data points per signal.
     * @param num     The number of signals.
     */
    RandomSpikes.inherits(cry.Source);
    function RandomSpikes(xmax, size, num) {
      this._dataReady   = false;
      this._slicedReady = false;
      this._xmax = xmax || 100;
      this._size = size || 1000;
      this._num  = num  || 1;
    }

    RandomSpikes.prototype.load = function(callback) {
      this._data = new Array(this._num);
      for ( var i = 0; i < this._num; i += 1) {
        var s = _randStyle();
        var d = new Float32Array(this._size * 2);
        var x = 0;
        var xstep = (this._xmax / this._size) * 2;
        for ( var j = 1; j < this._size * 2; j += 2) {
          x += Math.random() * xstep;
          d[j - 1] = x;
          d[j] = 0.01;
        }
        this._data[i] = {data : d, style : s};
      }
      this._dataReady = true;
      if (typeof(callback) == 'function')
        callback(this);
    };

    /**
     * Random style for the spike data.
     * Private function for internal use only.
     *
     * @returns A string with style information.
     */
    function _randStyle() {
      var rand256 = function() {
        return Math.round(Math.random() * 255);
      };
      return 'stroke:rgb(' + rand256() + ',' + rand256() + ',' + rand256() + ');stroke-opacity:0.85';
    }

    return RandomSpikes;
  })(); // end class RandomSpikes

})(cry || (cry = {})); // end module cry

