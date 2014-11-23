'use strict';

var git = require('../index'),
    Q = require('q');

describe('pull command', function() {
  var command = git.pull;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git pull', function() {
    return command({
          remote: 'upstream',
          branch: 'master',
          rebase: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'pull',
            'upstream',
            'master',
            '--rebase'
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

  it('should force to origin default remote', function() {
    return command({
          branch: 'master'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'pull',
            'origin',
            'master'
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
            'pull',
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
            'pull',
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
            'pull',
            'origin',
            'master'
          ]);
        });
  });

  it('should get current branch when no branch/tag is specified', function() {
    var stub = sinon.stub(git, 'getCurrentBranch');
    stub.returns(Q.when('currentone'));
    return command({})
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'pull',
            'origin',
            'currentone'
          ]);
        });
  });
});
