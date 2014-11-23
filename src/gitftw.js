'use strict';
var spawn = require('child_process').spawn,
    concat = require('concat-stream'),
    which = require('which').sync,
    assert = require('assert'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    Q = require('q'),
    resolvable = require('./resolvable');

/**
 * The event emmiter for GitFTW
 *
 * * Fires `command` the git command executed
 *
 * * Fires `result` the result from the command line
 *
 * @example
 * var git = require('gitftw');
 *
 * //Add a listener to the issued git command. Output it
 * git.events.on('command', console.info);
 *
 * //Add a listener to the result of the git command. Output it with >
 * git.events.on('result', function(res) {
 *   console.log('> ' + res.split('\n').join('\n> '))
 * });
 *
 * @memberof git
 * @name events
 * @type {EventEmmiter2}
 */
var events = new EventEmitter2();

/**
 * The full path to git shell, lazy loaded
 *
 * @private
 * @type {String}
 */
var gitCmd;

/**
 * Spawns a git process with the provider arguments
 * This function is called when you call directly the require of `gitftw`
 *
 * If you provide a second parameter
 *
 * DISCLAIMER: I've not found any way to document this in jsdoc and this
 * template in a proper way. Sorry for the possible missunderstanding
 *
 * @example
 * var git = require('gitftw');
 *
 * //executes a `git version`
 * git(['version'], function(err, data) { console.log(data);});
 * //or
 * git(['version']).then(console.log);
 *
 * @fires command the git command executed
 * @fires result the result from the command line
 *
 * @param {Resolvable|Array<String|null>} args The arguments to pass to git command
 * @param {callback} [cb] The execution callback result
 * @returns {Promise} Promise Resolves with the git output
 *   Rejects with an invalid/not found git cmd
 *   Rejects with an error with the git cmd spawn
 *   Rejects with git exits with an error
 */
function spawnGit(args) {
  //don't bother with throws, they are catched by promises
  gitCmd = gitCmd || which('git');
  assert.ok(args, 'arguments to git is mandatory');

  var defer = Q.defer();

  //Remove null values from the final git arguments
  args = args.filter(function(arg) {
    /*jshint eqnull:true */
    return arg != null;
  });

  /**
   * @name git#command
   * @event
   * @param {String} String the command issued
   */
  events.emit('command', [gitCmd].concat(args).join(' '));
  var proc = spawn(gitCmd, args);

  /**
   * @name git#result
   * @event
   * @param {String} String the captured output
   */
  var stdoutP = Q.defer();
  proc.stdout.pipe(concat(function(data) {
    var stdout = data.toString().trim();
    if (stdout) {
      events.emit('result', stdout);
    }
    stdoutP.resolve(stdout);
  }));

  var stderrP = Q.defer();
  proc.stderr.pipe(concat(function(data) {
    var stderr = data.toString().trim();
    if (stderr) {
      events.emit('result', stderr);
    }
    stderrP.resolve(stderr);
  }));

  proc.on('close', function(code) {
    //Some weird behaviours can arise with stdout and stderr values
    //cause writting to then is sync in *nix and async in windows.
    //Also, excessive treatment or long outputs that cause a drain
    //in the stderr & stdout streams, could lead us to having this proc
    //closed (and this callback called), and no complete values captured
    //in an eventual closure variable set then we emit the 'result' event
    //So using promises solves this syncronization
    Q.spread([stdoutP.promise, stderrP.promise], function(stdout, stderr) {
      if (code !== 0) {
        //Some warnings (like code === 1) are in stdout
        //fatal are in stderr. So try both
        var error = new Error('git exited with an error');
        error.code = code;
        error.output = stderr || stdout;
        defer.reject(error);
      } else {
        defer.resolve(stdout);
      }
    });
  });

  proc.on('error', function(error) {
    defer.reject(new Error(error));
  });

  return defer.promise;
}

/**
 * Decorates a function resolving its resolvables before calling it,
 * adding node callback api
 *
 * @private
 * @param {Function} fn The function to decorate
 * @param {Object} [options] The options object passed to the command
 * @param {callback} [cb] Callback used when in callback mode
 * @returns {Promise|undefined} A promise when in promise API
 */
function decorator(fn, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }

  return resolvable(options)
      .then(fn)
      .nodeify(cb);
}

/**
 * The module function
 *
 * It Spawns a child process for the git command line, capturing the output
 *
 * @example
 * var git = require('gitftw');
 *
 * //Execute a `git version`
 * git(['version'], function(err, data) { console.log(data);});
 * //or
 * git(['version']).then(console.log);
 *
 * @see {@link spawnGit} for a detailed description
 * @namespace
 *
 */
var git = decorator.bind(null, spawnGit);

/**
 * Creates a {@link command} in this module.
 * Third party developers must use it to create their owns
 * parameters
 *
 * @memberof git
 * @alias command
 * @param {command} fn The named function implementing a command
 * @returns {Function} function The gitftw module, for chainability
 */
function createCommand(fn) {
  assert.ok(fn.name, 'commands must be named functions');

  git[fn.name] = decorator.bind(null, fn);
  return git;
}

Object.defineProperty(git, 'command', {
  value: createCommand,
  enumerable: false,
  writable: false
});

Object.defineProperty(git, 'events', {
  value: events,
  enumerable: false,
  writable: false
});

module.exports = git;

/**
 * A gitftw command implementation.
 *
 * It only receives as parameter an options object.
 * The options object is {@link Resolvable|resolved} before reaching your
 * implementation
 *
 * The dual exported API (for Promises and node callbacks) is also managed for you.
 * Therefore you only have to deal with one paradigm in the implementation: The promises one.
 * It's safe to throw errors, and you have to return a promise or a value.
 *
 * For most use cases, you dont have to known too much of promises. Probably you will have to
 * call the `git([arguments])` that creates a promise, and you only will have to deal with
 * the output parsing and return it
 *
 * One extra thing: It must be a named function. The implemented command available in the
 * `gitftw` module, will be that name function.
 *
 * @example Creating a command
 *
 * var git = require('gitftw');
 *
 * //implement a command as a named function
 * function doSomethingAwesome(options) {
 *   //All properties in the options object are resolved here.
 *   //read the docs about what an *optional* `resolvable` concept is
 *   var resolvable = git.getCurrentBranch;
 *   //issue a `git awesome master param`
 *   return git(['awesome', resolvable, options.name])
 *     .then(parseAwesomeCommandResult);
 * }
 *
 * //implement an optional command parsing
 * function parseAwesomeCommandResult(res) {
 *   var lines = res.split('\n');
 *   if (lines[0] !== 'expected result') {
 *     //feel free to throw. It will be catched by the
 *     //promise engine and rejected or callbacked with err for you
 *     throw new Error('unable to parse the awesome');
 *   }
 *   //If everything goes well, return the command output
 *   return lines[1];
 * }
 *
 * //register a command
 * git.command(doSomethingAwesome);
 *
 * //Now it's available in the git module
 * git.doSomethingAwesome({
 *  //available in the command implementation as options.name
 *  name: 'param'
 * };
 *
 * @example Creating commands in your module
 * //your custom commands in mycommands.js
 * module.exports = function(git) {
 *   //doSomethingAwesome is defined elsewhere
 *   git.command(doSomethingAwesome);
 *
 *   //for chainable api: return git itself
 *   return git;
 * }
 *
 * //////
 * The userland: using your commands
 * var git = require('gitftw');
 * require('./mycommands')(git)
 *
 * git.doSomethingAwesome();
 *
 * @callback command
 * @param {Object} options The options to this command. All its properties are {@link Resolvable}
 * @returns {Promise} Promise The execution promise
 */

/**
 * A Typical node callback
 *
 * @callback callback
 * @param {Error|null} err The error (if any)
 * @param {*|undefined} result The result of executing the command
 */
