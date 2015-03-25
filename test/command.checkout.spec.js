'use strict';
var git = require('../index');

describe('checkout command', function() {
  var command = git.checkout;

  it('should exists', function(){
    expect(command).to.be.a('function');
  });

  it('should issue a git checkout with create', function() {
    return command({
          branch: 'develop',
          create: true,
          force: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'checkout',
            '-B',
            'develop',
            '-f'
          ]);
        });
  });

  it('should issue a git checkout with old create', function() {
    return command({
      branch: 'develop',
      oldCreate: true,
      force: true
    })
      .tap(function() {
        var call = mockSpawn.calls.pop();
        expect(call.args).to.be.eql([
          'checkout',
          '-b',
          'develop',
          '-f'
        ]);
      });
  });

  it('should issue a git checkout with orphan', function() {
    return command({
          branch: 'develop',
          orphan: true
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'checkout',
            '--orphan',
            'develop'
          ]);
        });
  });

  it('should return an empty response', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'lalala'));

    return command({
          branch: 'develop'
        })
        .tap(function(res) {
          expect(res).to.be.empty;
        });
  });

  it('should use tag when no branch is specified', function() {
    return command({
          tag: 'v1.0'
        })
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'checkout',
            'v1.0'
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
            'checkout',
            'master'
          ]);
        });
  });

  it('should fail without branch or tag', function() {
    return command({})
        .catch(function(err) {
          expect(err).to.match(/branch or tag is mandatory/)
        });
  });

  it('should fail when both create and orphan ', function() {
    return command({
          branch: 'develop',
          create: true,
          orphan: true
        })
        .catch(function(err) {
          expect(err).to.match(/create and orphan cannot be specified both together/);
        });
  });

  it('should fail when both create and oldCreate', function() {
    return command({
          branch: 'develop',
          create: true,
          oldCreate: true
        })
        .catch(function(err) {
          expect(err).to.match(/create and oldCreate cannot be specified both together/);
        });
  });

});
