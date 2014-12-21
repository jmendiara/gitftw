'use strict';
var Promise = require('bluebird'),
    git = require('../index');

describe('isClean command', function() {
  var command = git.isClean;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git diff-index', function() {
    return command()
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'diff-index',
            '--quiet',
            'HEAD',
            '.'
          ]);
        });
  });

  it('should return true when is clean', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0));
    return command()
        .tap(function(isClean) {
          expect(isClean).to.be.true;
        });
  });

  it('should return true when is dirty', function() {
    mockSpawn.sequence.add(mockSpawn.simple(1));

    return command()
        .tap(function(isClean) {
          expect(isClean).to.be.false;
        });
  });

  it('should fail when git does', function() {
    mockSpawn.sequence.add(mockSpawn.simple(128));

    return command()
        .then(Promise.reject)
        .catch(Promise.resolve);
  });

});
