'use strict';

var git = require('../index');

describe('add command', function() {
  var command = git.push;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git push', function() {
    return command({
          remote: 'upstream',
          branch: 'master',
          force: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'upstream',
            'master',
            '--force'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));
    return command({})
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should force to origin and HEAD with nothing specified', function() {
    return command({
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'origin',
            'HEAD'
          ]);
        });
  });

  it('should use tag when no branch is specified', function() {
    return command({
          tag: 'v1.0'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'origin',
            'v1.0'
          ]);
        });
  });

  it('should use branch when both branch and tag are specified', function() {
    return command({
          branch: 'develop'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'origin',
            'develop'
          ]);
        });
  });

  it('should use branch when both branch and tag are specified', function() {
    return command({
          branch: 'master',
          tag: 'v1.0'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'origin',
            'master'
          ]);
        });
  });
});
