'use strict';
/**
 * Resolvable is something that have invariant primitives, including all its properties,
 * now or in the future.
 *
 * Which things are _resolvables_?
 *
 * 1. A String, Number, Boolean primitives: `string`, 4, true
 *
 * 2. A array of resolvables: `['string', resolvable]`
 *
 * 3. A literal object with resolvables properties: `{ foo: 'string', bar: resolvable }`
 *
 * 5. An object with a `toString` method
 *
 * 6. An A+ promise (Q, bluebird, native...) that resolves to a resolvable: `Promise.when('string')`
 *
 * 7. A function that returns resolvables `function() { return 'string'; }`
 *
 * __resolvables__ are resolved in serie. Once something is resolved, goes to resolve
 * the next one. Never in parallel. This avoids race conditions
 * in your workflows while maintaining your code clean.
 *
 * @example
 * //Using Q as promise library
 *
 * var resolvableArray = [
 *   'string',
 *   Q.when('string'),
 *   function() {
 *    return 'string';
 *   },
 *   function() {
 *    return Q.when('string');
 *   }
 * ];
 * var resolvableObject = {
 *  arr: resolvableArray,
 *  string: 'string'
 * }
 *
 * //In the future, after resolving it, will become
 * var resolvableArray = ['string', 'string', 'string', 'string'];
 * var resolvableObject = {
 *  arr: ['string', 'string', 'string', 'string'],
 *  string: 'string'
 * }
 *
 *
 * @typedef Resolvable
 */

var Promise = require('bluebird');

/**
 * Returns true when an  object is a Promise-like one
 * @param {*} o The thing to test
 * @returns {boolean} true when is promise-like, false otherwise
 */
function isThenable(o) {
  return o && typeof o.then === 'function';
}

/**
 * Resolves an array
 *
 * @private
 * @param {Array} arg  The array to resolve
 * @returns {Promise} The resolved array
 */
function resolveArray(arg) {
  var resolvedArray = new Array(arg.length);
  return arg
      .reduce(function(soFar, value, index) {
        return soFar
            .then(resolveItem.bind(null, value))
            .then(function(value) {
              resolvedArray[index] = value;
            });
      }, Promise.resolve())
      .then(function() {
        return resolvedArray;
      });
}

/**
 * Resolves an object
 *
 * @private
 * @param {Object} arg The object to resolve
 * @returns {Promise} The resolved object
 */
function resolveObject(arg) {
  var resolvedObject = {};
  return Object.keys(arg)
      .reduce(function(soFar, key) {
        return soFar
            .then(resolveItem.bind(null, arg[key]))
            .then(function(value) {
              resolvedObject[key] = value;
            });
      }, Promise.resolve())
      .then(function() {
        return resolvedObject;
      });
}

/**
 * Resolves something resolvable
 *
 * @private
 * @param {*} arg The argument to resolve
 * @returns {Promise} The resolved
 */
function resolveItem(arg) {
  if (Array.isArray(arg)) {
    return resolveArray(arg);
  } else if (Object.prototype.toString.call(arg) === '[object Function]') {
    //is a function
    return Promise.method(arg)().then(resolveItem);
  } else if (isThenable(arg)) {
    //is a promise
    return arg.then(resolveItem);
  } else if (arg && typeof arg === 'object') {
    //is an object
    if (typeof arg.toString === 'function') {
      var value = arg.toString();
      if (value !== '[object Object]') {
        //with a valid toString
        return Promise.resolve(value);
      }
    }
    return resolveObject(arg);
  } else {
    //Yeah! a value
    return Promise.resolve(arg);
  }
}

module.exports = resolveItem;
