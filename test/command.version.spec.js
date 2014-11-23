'use strict';
var git = require('../index');

describe('version command', function() {
  var command = git.version;
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git version', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'git version 1.2'));
    return command()
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'version'
          ]);
        });
  });

  it('should return the git version', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'git version 1.2'));
    return command()
        .tap(function(res) {
          expect(res).to.be.eql('1.2');
        });
  });

  it('should fail with invalid response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));
    return command()
        .catch(function(err) {
          expect(err).to.match(/Unable to parse version response/);
        });
  });
});
