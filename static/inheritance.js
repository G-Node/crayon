// ---------- file: inheritance.js ---------- //


/**
 * Mixin on Function in order to provide easier inheritance.
 * Adds a property parent to the prototype of the function which
 * contains the parent object or function.
 *
 * @param parent The super class or object.
 */
Function.prototype.inherits = function(parent) {
  if (typeof(parent.constructor) === 'function') {
    this.prototype = new parent();
    this.prototype.constructor = this;
    this.prototype.parent = parent.prototype;
  } else {
    this.prototype = parent;
    this.prototype.constructor = this;
    this.prototype.parent = parent;
  }
};
