'use strict';
var git = require('../index');

describe('add command', function() {
  var command = git.add;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git add', function() {
    return command({
          files: ['foo.txt', 'bar.js']
        })
        .tap(function() {
          var calls = mockSpawn.calls;
          var call2 = calls.pop();
          var call1 = calls.pop();
          expect(call1.args).to.be.eql([
            'add',
            'foo.txt'
          ]);
          expect(call2.args).to.be.eql([
            'add',
            'bar.js'
          ]);
        });
  });

  it('should not issue a git add for invalid file', function() {
    return command({
          files: ['foo.txt', '', null ]
        })
        .tap(function() {
          //If some git add was performed, that should be the last ones
          //executed for null or '' files in the above array
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'add',
            'foo.txt'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));
    return command({
          files: ['foo.txt']
        })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should fail without files parameter', function() {
    return command({})
        .catch(function(err) {
          expect(err).to.match(/files is mandatory/)
        });
  });

  it('should not fail with an empty files parameter', function() {
      return command({
        files: []
      });
  });

});
