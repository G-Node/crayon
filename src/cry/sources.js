// ---------- file: cry/renderer.js ---------- //


// Augment module 'cry'
var cry; (function(cry) {
  "use strict";

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
     * @param xmax    The maximum x value.
     * @param ymax    The maximum y value.
     * @param size    The number of data points per signal.
     * @param num     The number of signals.
     */
    function RandomSignal(xmax, ymax, size, num) {
      this._xmax = xmax || 100;
      this._ymax = ymax || 1000;
      this._size = size || 1000;
      this._num = num || 1;
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
    }

    /**
     * Return all data.
     *
     * @returns All data from this source.
     */
    RandomSignal.prototype.data = function() {
      return this._data;
    };

    /**
     * Object containing the borders of all data from this source.
     * Structure: {xmin : num, xmax : num, ymin : num, ymax : num}
     *
     * @returns The border values for the current data.
     */
    RandomSignal.prototype.borders = function() {
      var xmin = 0, xmax = 0, ymin = 0, ymax = 0;
      var all = this._data;
      for ( var i = 0; i < all.length; i += 1) {
        var data = all[i].data;
        for ( var j = 1; j < data.length; j += 2) {
          var x = data[j - 1];
          var y = data[j];
          if (x < xmin)
            xmin = x;
          else if (x > xmax)
            xmax = x;
          if (y < ymin)
            ymin = y;
          else if (y > ymax)
            ymax = y;
        }
      }
      return {xmin : xmin, xmax : xmax, ymin : ymin, ymax : ymax};
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
   * @returns {Function} Constructor for RandomSpikes
   ******************************************************************************/
  cry.RandomSpikes = (function() {

    /**
     * Constructor for the class RandomSpikes.
     *
     * @param xmax    The maximum x value.
     * @param size    The number of data points per signal.
     * @param num     The number of signals.
     */
    function RandomSpikes(xmax, size, num) {
      this._xmax = xmax || 100;
      this._size = size || 1000;
      this._num = num || 1;
      this._data = new Array(this._num);
      for ( var i = 0; i < this._num; i += 1) {
        var s = _randStyle();
        var d = new Float32Array(this._size * 2);
        var x = 0;
        var y = i;
        var xstep = (this._xmax / this._size) * 2;
        for ( var j = 1; j < this._size * 2; j += 2) {
          x += Math.random() * xstep;
          d[j - 1] = x;
          d[j] = y;
        }
        this._data[i] = {data : d, style : s};
      }
    }

    /**
     * Return all data.
     *
     * @returns All data from this source.
     */
    RandomSpikes.prototype.data = function() {
      return this._data;
    };

    /**
     * Object containing the borders of all data from this source.
     * Structure: {xmin : num, xmax : num, ymin : num, ymax : num}
     *
     * @returns The border values for the current data.
     */
    RandomSpikes.prototype.borders = function() {
      var all = this._data;
      var xmin = 0, xmax = 0, ymin = 0, ymax = 0.1;
      for ( var i = 0; i < all.length; i += 1) {
        var data = all[i].data;
        if (data[0] < xmin)
          xmin = data[0];
        if (data[data.length - 2] > xmax)
          xmax = data[data.length - 2];
      }
      return {xmin : xmin, xmax : xmax, ymin : ymin, ymax : ymax};
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

