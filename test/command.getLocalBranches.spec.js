'use strict';
var git = require('../index');

describe('getLocalBranches command', function() {
  var command = git.getLocalBranches;
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git for-each-ref', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, ''));

    return command()
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'for-each-ref',
            '--format=\%(refname:short)',
            'refs/heads/'
          ]);
        });
  });

  it('should return the local branches version', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0,
        'develop\n' +
        'gh-pages\n' +
        'issue/1\n' +
        'master\n'
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
});
