'use strict';

var Q = require('q'),
    resolvable = require('../src/resolvable');

describe('Resolvable things', function() {
  var Obj = function() {
    return {
      toString: function() {
        return 'instance'
      }
    }
  };

  var simpleObject = {
    string: 'string',
    promise: Q.when('promise'),
    func: function() { return 'func' },
    promiseFn: function() { return Q.when('promiseFn') }
  };

  var simpleArray =Object.keys(simpleObject)
      .reduce(function(memo, key) {
        return memo.concat(simpleObject[key]);
      }, []);

  var resolvableObject = {
    string: 'string',
    promise: Q.when('promise'),
    func: function() { return 'func'},
    promiseFn: function() { return Q.when('promiseFn') },
    objFn: function() { return simpleObject },
    arrayFn: function() { return simpleArray },
    resolvableFnObj: function() { return Q.when(simpleObject) },
    resolvableFnArr: function() { return Q.when(simpleArray) },
    fnfn: function() { return function() { return 'fnfn'} },
    instance: new Obj(),
    nan: NaN,
    undef: undefined,
    nul: null,
    boolt: true,
    boolf: false,
    number: 4,
    regex: /regex/,
    literal: {
      a: 'b'
    }
  };

  it('should resolve', function() {
    return resolvable(resolvableObject)
        .then(function(resolved) {
          expect(resolved).to.be.eql({
            string: 'string',
            promise: 'promise',
            func: 'func',
            promiseFn: 'promiseFn',
            objFn: {
              string: 'string',
              promise: 'promise',
              func: 'func',
              promiseFn: 'promiseFn'
            },
            arrayFn: ['string', 'promise', 'func', 'promiseFn'],
            resolvableFnObj: {
              string: 'string',
              promise: 'promise',
              func: 'func',
              promiseFn: 'promiseFn'
            },
            resolvableFnArr: ['string', 'promise', 'func', 'promiseFn'],
            fnfn: 'fnfn',
            instance: 'instance',
            nan: NaN,
            undef: undefined,
            nul: null,
            boolt: true,
            boolf: false,
            number: 4,
            regex: '/regex/',
            literal: {
              a: 'b'
            }
          })
        });
  });
});
