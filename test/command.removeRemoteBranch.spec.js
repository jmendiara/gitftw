'use strict';
var git = require('../index');

describe('removeRemoteBranch command', function() {
  var command = git.removeRemoteBranch;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git push', function() {
    return command({
          branch: 'develop',
          remote: 'upstream'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'push',
            'upstream',
            ':develop'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0), 'lalala');
    return command({ branch: 'cha' })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should fail without branch parameter', function() {
    return command({})
        .catch(function(err) {
          expect(err).to.match(/branch is mandatory/)
        });
  });

  it('should fail when git fails', function() {
    mockSpawn.sequence.add(mockSpawn.simple(128));
    return command({ branch: 'cha' })
        .catch(function(err) {
          expect(err.code).to.be.eql(128);
        });
  });
});
