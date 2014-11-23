'use strict';
var git = require('../index');

describe('fetch command', function() {
  var command = git.fetch;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git merge', function() {
    return command({
          remote: 'upstream',
          tags: true,
          prune: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'fetch',
            'upstream',
            '--tags',
            '--prune'
          ]);
        });
  });

  it('should issue a git fetch with remote origin default', function() {
    return command({})
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'fetch',
            'origin'
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

});
