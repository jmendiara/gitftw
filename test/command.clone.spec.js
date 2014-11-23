'use strict';
var git = require('../index');

describe('clone command', function() {
  var command = git.clone;
  
  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git clone', function() {
    return command({
          repository: 'git@github.com:jmendiara/gitftw.git',
          directory: './cha',
          branch: 'master',
          origin: 'upstream',
          recursive:true,
          bare: true,
          depth: 5
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'clone',
            'git@github.com:jmendiara/gitftw.git',
            './cha',
            '-bmaster',
            '-oupstream',
            '--recursive',
            '--bare',
            '--depth',
            '5'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));

    return command({
          repository: 'git@github.com:jmendiara/gitftw.git'
        })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should use tag when no branch is specified', function() {
    return command({
      repository: 'git@github.com:jmendiara/gitftw.git',
      tag: 'v1.0'
    })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'clone',
            'git@github.com:jmendiara/gitftw.git',
            '-bv1.0'
          ]);
        });
  });

  it('should use branch when both branch and tag are specified', function() {
    return command({
      repository: 'git@github.com:jmendiara/gitftw.git',
      branch: 'master',
      tag: 'v1.0'
    })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'clone',
            'git@github.com:jmendiara/gitftw.git',
            '-bmaster'
          ]);
        });
  });

  it('should fail without repository parameter', function() {
    return command({})
        .catch(function(err) {
          expect(err).to.match(/repository is mandatory/)
        });
  });

});
