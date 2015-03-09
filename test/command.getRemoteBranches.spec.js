'use strict';
var git = require('../index');

describe('getRemoteBranches command', function() {
  var command = git.getRemoteBranches;
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git ls-remote', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0,
        '4bcaddf8aa14b44948b20facbd7d8e97d8d8385c        refs/heads/master\n'
    ));

    return command()
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'ls-remote',
            '--heads',
            'origin'
          ]);
        });
  });

  it('should allow specifiying a remote', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0,
        '4bcaddf8aa14b44948b20facbd7d8e97d8d8385c        refs/heads/master\n'
    ));

    return command({
          remote: 'upstream'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'ls-remote',
            '--heads',
            'upstream'
          ]);
        });
  });

  it('should return the remote branches version', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0,
        '550a26f8dc6a9383c13c7afd7cd385c2976ffb2d        refs/heads/develop\n' +
        'e7d9dc782497c4bfdb26777c7762060d9bccb5eb        refs/heads/gh-pages\n' +
        '831b2ca793e076cdbcee2b17c227b2ce12b6de83        refs/heads/issue/1\n' +
        '4bcaddf8aa14b44948b20facbd7d8e97d8d8385c        refs/heads/master\n'
    ));
    return command()
        .tap(function(res) {
          expect(res).to.be.eql([
              'develop',
              'gh-pages',
              'issue/1',
              'master'
          ]);
        });
  });

  it('should fail with invalid response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));
    return command()
        .then(function() {
          throw new Error('should have thro');
        })
        .catch(function(err) {
          expect(err).to.match(/Unable to parse ls-remote response/);
        });
  });
});
