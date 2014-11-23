'use strict';
var sinon = require ('sinon'),
    chai = require ('chai'),
    sinonChai = require('sinon-chai'),
    mockSpawn = require('mock-spawn'),
    proxyquire = require('proxyquire');

chai.use(sinonChai);

global.expect = chai.expect;
global.should = chai.should();

beforeEach(function(){
  global.sinon = sinon.sandbox.create();
});

afterEach(function(){
  global.sinon.restore();
});

//Mock calls to spawn in test
global.mockSpawn = mockSpawn();
proxyquire('../src/gitftw', {
  child_process: {
    spawn: global.mockSpawn
  },
  which: {
    sync: function() {
      return 'mockgit'
    }
  }
});



