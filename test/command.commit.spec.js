'use strict';
var git = require('../index');

describe('commit command', function() {
  var command = git.commit;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git commit', function() {
    return command({
          message: 'cha',
          force: true,
          noVerify: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'commit',
            '--amend',
            '-n',
            '-m',
            'cha'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0), 'lalala');
    return command({ message: 'cha' })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should fail without message parameter', function() {
    return command({})
        .catch(function(err) {
          expect(err).to.match(/message is mandatory/)
        });
  });

  it('should fail when git fails', function() {
    mockSpawn.sequence.add(mockSpawn.simple(128));
    return command({ message: 'cha' })
        .catch(function(err) {
          expect(err.code).to.be.eql(128);
        });
  });

  it('should not fail when nothing is commited', function() {
    mockSpawn.sequence.add(mockSpawn.simple(1));
    return command({ message: 'cha' })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'commit',
            '-m',
            'cha'
          ]);
        });
  });
});
