'use strict';
var git = require('../index');

describe('merge command', function() {
  var command = git.merge;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git merge', function() {
    return command({
      branch: 'develop',
      message: 'merge it',
      noFF: true,
      remote: 'origin'
    })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'merge',
            '--no-ff',
            'origin/develop',
            '-m',
            'merge it'
          ]);
        });
  });

  it('should issue a git merge with local branch', function() {
    return command({
          branch: 'develop',
          message: 'merge it',
          noFF: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'merge',
            '--no-ff',
            'develop',
            '-m',
            'merge it'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));

    return command({
          branch: 'develop',
          message: 'merge it'
        })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should fail without branch', function() {
    return command({
          message: 'merge it'
        })
        .catch(function(err) {
          expect(err).to.match(/branch is mandatory/)
        });
  });

  it('should fail without message', function() {
    return command({
          branch: 'develop'
        })
        .catch(function(err) {
          expect(err).to.match(/message is mandatory/)
        });
  });
});
