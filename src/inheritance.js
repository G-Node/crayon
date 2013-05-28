

Function.prototype.inherits = function(parent) {
  if (typeof(parent.constructor) === 'function') {
    this.prototype = new parent();
    this.prototype.constructor = this;
    //this.prototype.parent = parent.prototype;
    this.parent = parent.prototype;
  } else {
    this.prototype = parent;
    this.prototype.constructor = this;
    // this.prototype.parent = parent;
    this.parent = parent;
  }
};
