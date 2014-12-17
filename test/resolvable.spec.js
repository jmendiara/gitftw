'use strict';

var Promise = require('bluebird'),
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
    promise: Promise.resolve('promise'),
    func: function() { return 'func' },
    promiseFn: function() { return Promise.resolve('promiseFn') }
  };

  var simpleArray =Object.keys(simpleObject)
      .reduce(function(memo, key) {
        return memo.concat(simpleObject[key]);
      }, []);

  var resolvableObject = {
    string: 'string',
    promise: Promise.resolve('promise'),
    func: function() { return 'func'},
    promiseFn: function() { return Promise.resolve('promiseFn') },
    objFn: function() { return simpleObject },
    arrayFn: function() { return simpleArray },
    resolvableFnObj: function() { return Promise.resolve(simpleObject) },
    resolvableFnArr: function() { return Promise.resolve(simpleArray) },
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
