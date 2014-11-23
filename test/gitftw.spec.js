'use strict';
var Q = require('q'),
    git = require('../index');

describe('Git commands execution', function() {
  it('should remove the null parameters when calling git', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0));
    return git(['this', null, 'is', undefined, 'sparta', '!'])
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.command).to.be.eql('mockgit');
          expect(call.args).to.be.eql([
            'this', 'is', 'sparta', '!'
          ]);
        });
  });

  it('should resolve the parameters', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0));
    return git([
          'this',
          Q.when('is'),
          function() { return 'sparta'},
          null,
          function() { return Q.when('!') }
        ])
        .tap(function() {
          var call = mockSpawn.calls.pop();
          expect(call.args).to.be.eql([
            'this', 'is', 'sparta', '!'
          ]);
        });
  });

  it('should resolve with stdout', function() {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'this is sparta!'));
    return git(['cha'])
        .tap(function(res) {
          var call = mockSpawn.calls.pop();
          expect(res).to.be.eql('this is sparta!');
        });
  });

  it('should reject with stdout when git exits with 1', function() {
    mockSpawn.sequence.add(mockSpawn.simple(1, 'this is sparta!', ''));
    return git(['cha'])
        .catch(function(err) {
          var call = mockSpawn.calls.pop();
          expect(err.code).to.be.eql(1);
          expect(err.output).to.be.eql('this is sparta!');
        });
  });

  it('should reject with stderr when git fails', function() {
    mockSpawn.sequence.add(mockSpawn.simple(128, '', 'this is huesca!'));
    return git(['cha'])
        .catch(function(err) {
          var call = mockSpawn.calls.pop();
          expect(err.code).to.be.eql(128);
          expect(err.output).to.be.eql('this is huesca!');
        });
  });

  it('should reject with a mockSpawn error', function() {
    var error = new Error('ENOENT');
    mockSpawn.sequence.add(function (cb) {
      this.emit('error', error);
      cb();
    });
    return git(['cha'])
        .catch(function(err) {
          expect(err).to.be.eql(error);
        });
  });

  it('should emit events', function() {
    var commandSpy = sinon.spy(),
        resultSpy = sinon.spy();
    git.events.on('command', commandSpy);
    git.events.on('result', resultSpy);

    mockSpawn.sequence.add(mockSpawn.simple(0, 'this is sparta!'));
    return git(['cha'])
        .then(function() {
          expect(commandSpy).to.have.been.calledWith('mockgit cha');
          expect(resultSpy).to.have.been.calledWith('this is sparta!');
        });
  });

  it('should be compatible with callbacks', function(done) {
    mockSpawn.sequence.add(mockSpawn.simple(0, 'this is sparta!'));
    git(['cha'], function(err, res) {
      var call = mockSpawn.calls.pop();
      expect(res).to.be.eql('this is sparta!');
      done(err);
    });
  });
});

describe('command creation', function() {

  it('should be able to create commands in the git module', function() {
    git.command(function noop() {});

    expect(git.noop).to.be.a('function');
  });

  it('should be able to create empty signatures functions', function(done) {
    git.command(function noop() { return 'cha'});

    git.noop()
        .then(function(res) {
          expect(res).to.be.eql('cha');
          git.noop(function(err, res) {
            expect(res).to.be.eql('cha');
            done(err);
          });
        });
  });

  it('should be able to create options signature functions', function(done) {
    git.command(function noop() { return 'cha'});

    git.noop({})
        .then(function(res) {
          expect(res).to.be.eql('cha');
          git.noop({}, function(err, res) {
            expect(res).to.be.eql('cha');
            done(err);
          });
        });
  });

  it('should not allow to create anonymous commands', function() {
    expect(git.command.bind(null, function() {})).to.throw;
  });
});