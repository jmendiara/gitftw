'use strict';

var assert = require('assert'),
    Promise = require('bluebird');

/**
 *
 *
 * @param {Function} git The gitftw module
 * @returns {Function} The gitftw with the new commands
 */
module.exports = function commonCommands(git) {
  [
    commit,
    version,
    clone,
    add,
    push,
    pull,
    checkout,
    merge,
    fetch,
    getCurrentBranch,
    tag,
    getTags,
    removeLocalTags,
    removeRemoteTags,
    removeTags
  ].forEach(git.command);

  return git;

  //////////// Commands implementation

  /**
   * Gets current installed git version
   * Executes `git version`
   *
   * @example
   * var git = require('gitftw');
   *
   * git.version().then(console.log) //outputs 1.8.2.3
   *
   *
   * @memberof git
   * @type {command}
   * @returns {Promise} Promise Resolves with the git version
   */
  function version() {
    var args = [
      'version'
    ];

    return git(args)
        .then(parseVersion);
  }

  /**
   * Commits the staging area
   * Executes `git commit -m "First commit"`
   *
   * It does not fail when there is not anything to commit
   *
   * @example
   * var git = require('gitftw');
   *
   * git.commit({
   *   message: 'First commit'
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} options.message The commit message
   * @param {Resolvable|Boolean} [options.force] Replace the tip of the current branch by creating
   *   a new commit. The --amend flag
   * @param {Resolvable|Boolean} [options.noVerify] This option bypasses the pre-commit
   *   and commit-msg hooks
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function commit(options) {
    assert.ok(options.message, 'message is mandatory');

    var args = [
      'commit',
      options.force ? '--amend' : null,
      options.noVerify ? '-n' : null,
      options.message ? '-m' : null,
      options.message ? options.message : null
    ];

    return git(args)
        .catch(passWarning)
        .then(silent);
  }

  /**
   * Clones a git repo
   *
   * If both a branch and a tag are specified, the branch takes precedence
   *
   * @example
   * var git = require('gitftw');
   *
   * git.clone({
   *  repository: 'git@github.com:jmendiara/node-lru-cache.git',
   *  directory: './cache' //optional
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} options.repository The git repository endpoint
   * @param {Resolvable|String} [options.directory] The directory where the repo will be cloned
   *   By default, git will clone it a new one specifed by the repo name
   * @param {Resolvable|String} [options.branch] The remote repo branch to checkout after clone.
   * @param {Resolvable|String} [options.tag] The remote repo tag to checkout after clone.
   * @param {Resolvable|String} [options.origin] Instead of using the remote name origin to keep
   *   track of the upstream repository, use this parameter value
   * @param {Resolvable|Boolean} [options.recursive] After the clone is created, initialize all
   * @param {Resolvable|Boolean} [options.bare] Make a bare Git repository.: neither remote-tracking
   *   branches nor the related configuration variables are created.
   * @param {Resolvable|Number} [options.depth] Create a shallow clone with a history truncated to
   *   the specified number of revisions.
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function clone(options) {
    assert.ok(options.repository, 'repository is mandatory');

    var branchOrTag = options.branch || options.tag;
    var args = [
      'clone',
      options.repository,
      options.directory,
      branchOrTag ? ('-b' + branchOrTag) : null,
      options.origin ? ('-o' + options.origin) : null,
      options.recursive ? '--recursive' : null,
      options.bare ? '--bare' : null,
      options.depth ? '--depth' : null,
      options.depth ? '' + options.depth : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Adds filenames to the stashing area
   * Issues `git add README.md`
   *
   * @example
   * var git = require('gitftw');
   *
   * git.add({
   *   files: ['README.md', 'index.js']
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|Array<String>} options.files The files to be added, relative to the cwd
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function add(options) {
    assert.ok(options.files, 'files is mandatory');

    return options.files
        .filter(function(file) {
          //Git exits OK with empty filenames.
          //Avoid an unnecessary call to git in these cases by removing the filename
          return !!file;
        })
        .reduce(function(soFar, file) {
          var args = ['add', file];
          return soFar
              .then(gitFn(args))
              .then(silent);
        }, Promise.resolve());
  }

  /**
   * Push the change sets to server
   * Executes `git push origin master`
   *
   * Defaults to "origin", and don't follow configured refspecs
   * for the upstream
   *
   * If both a branch and a tag are specified, the branch takes precedence
   *
   * @example
   * var git = require('gitftw');
   *
   * git.push(); //the current branch to `origin`
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote="origin"] The remote ref to push to
   * @param {Resolvable|String} [options.branch="HEAD"] The branch to push. HEAD will push the
   *   current branch
   * @param {Resolvable|String} [options.tag] The tag to push
   * @param {Resolvable|Boolean} [options.force] Force a remote update. Can cause the remote
   *   repository to lose commits; use it with care. --force flag
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function push(options) {
    var branchOrTag = options.branch || options.tag;

    var args = [
      'push',
      options.remote || 'origin',
      branchOrTag || 'HEAD',
      options.force ? '--force' : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Pulls a remote branch into the current one
   * Executes `git pull origin master --rebase`
   *
   * remote defaults to "origin", and don't follow configured refspecs
   * for the upstream
   *
   * If both a branch and a tag are specified, the branch takes precedence
   *
   * When no branch and tag are specifies, this command will try
   * to pull the actual local branch name from the remote
   *
   * @example
   * var git = require('gitftw');
   *
   * //While in master...
   * git.getCurrentBranch().then(console.log)
   * //Outputs: master
   *
   * //Pulls origin/master into the current branch (master)
   * git.pull()
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote="origin"] The remote
   * @param {Resolvable|String} [options.branch=currentBranch] The remote branch to pull
   * @param {Resolvable|String} [options.tag] The remote tag to pull
   * @param {Resolvable|Boolean} [options.rebase] Make a rebase (--rebase tag)
   * @param {callback} [cb] The execution callback result
   * @return {Promise} Resolves with undefined
   */
  function pull(options) {
    var branchOrTag = options.branch || options.tag;

    var args = [
      'pull',
      options.remote || 'origin',
      branchOrTag || git.getCurrentBranch,
      options.rebase ? '--rebase' : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Checkout a local branch
   *
   * Executes `git checkout -B issues/12`
   *
   * If you specify create, it will try to create the branch,
   * or will checkout it if it already exists
   *
   * If both a branch and a tag are specified, the branch takes precedence
   *
   * Cannot use create and orphan both together
   *
   * @example
   * var git = require('gitftw');
   *
   * git.checkout({
   *   branch: 'master'
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} options.branch The branch to checkout
   * @param {Resolvable|String} [options.tag] The tag to checkout
   * @param {Resolvable|Boolean} [options.create] Try to create the branch (-B flag)
   * @param {Resolvable|Boolean} [options.orphan] Create an orphan branch (--orphan flag)
   * @param {Resolvable|Boolean} [options.force] When switching branches, proceed even if
   *  the index or the working tree differs from HEAD. This is used to throw
   *  away local changes. (-f flag)
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function checkout(options) {
    var branchOrTag = options.branch || options.tag;

    assert.ok(branchOrTag, 'branch or tag is mandatory');

    if (options.create && options.orphan) {
      throw new Error('create and orphan cannot be specified both together');
    }

    var args = [
      'checkout',
      options.create ? '-B' : null,
      options.orphan ? '--orphan' : null,
      branchOrTag,
      options.force ? '-f' : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Merges branches a branch in the current one
   * Executes `git merge --no-ff origin/issues13 -m "Remote branch merge"
   *
   * @example
   * var git = require('gitftw');
   *
   * //while in master...
   * git.merge({
   *   branch: 'issue/12',
   *   message: 'Merge branch issue/12 into master'
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote] The remote where the branch is located
   * @param {Resolvable|String} options.branch The branch to merge
   * @param {Resolvable|String} options.message The merge message
   * @param {Resolvable|Boolean} [options.noFF] Make a no fast forward merge,
   *  creating a new sha (--no-ff flag)
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function merge(options) {
    assert.ok(options.branch, 'branch is mandatory');
    assert.ok(options.message, 'message is mandatory');

    var args = [
      'merge',
      options.noFF ? '--no-ff' : null,
      options.remote ? (options.remote + '/' + options.branch) : options.branch,
      '-m',
      options.message
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Fetches a remote
   * Executes `git fetch origin --tags`
   *
   * remote defaults to "origin", and don't follow configured refspecs
   * for the upstream
   *
   * @example
   * var git = require('gitftw');
   *
   * git.fetch(); //fetches origin
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote="origin"] The remote to fetch
   * @param {Resolvable|Boolean} [options.tags] Fetch the tags (--tags flag)
   * @param {Resolvable|Boolean} [options.prune] remove any remote-tracking references that no
   *   longer exist on the remote (--prune)
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function fetch(options) {

    var args = [
      'fetch',
      options.remote || 'origin',
      options.tags ? '--tags' : null,
      options.prune ? '--prune' : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Gets the current branch
   * Executes `git rev-parse --abbrev-ref HEAD`
   *
   * @example
   * var git = require('gitftw');
   *
   * //while in master...
   * git.getCurrentBranch().then(console.log); //outputs 'master';
   *
   * @memberof git
   * @type {command}
   *
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with the current branch
   */
  function getCurrentBranch() {
    var args = [
      'rev-parse',
      '--abbrev-ref',
      'HEAD'
    ];

    return git(args);
  }

  /**
   * Creates a git tag
   * Executes `git tag v1.0.0 -m "v1.0.0" -a`
   *
   * @example
   * var git = require('gitftw');
   *
   * git.tag({
   *  tag: 'v1.2.0'
   * })
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} options.tag The tag name
   * @param {Resolvable|String} [options.message] The tag message. Mandatory when creating
   *  an annotated tag
   * @param {Resolvable|Boolean} [options.annotated] Should this tag be annotated?
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function tag(options) {
    assert.ok(options.tag, 'tag name is mandatory');
    if (options.annotated) {
      assert.ok(options.message, 'message is mandatory when creating an annotated tag');
    }

    var args = [
      'tag',
      options.tag,
      options.annotated ? '-a' : null,
      options.message ? '-m' : null,
      options.message ? options.message : null
    ];

    return git(args)
        .then(silent);
  }

  /**
   * Gets the local tags
   * Executes `git tag`
   *
   * @example
   * var git = require('gitftw');
   *
   * git.getTags().then(console.log); //outputs ['v1.0.0', 'v1.0.1']
   *
   * @memberof git
   * @type {command}
   *
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with the array of tags
   */
  function getTags() {
    var args = [
      'tag'
    ];

    return git(args)
        .then(parseTags);
  }

  /**
   * Removes a set of tags from the local repo
   * Executes `git tag -d v1.0.0`
   *
   * It does not fail when the tag does not exists
   *
   * @example
   * var git = require('gitftw');
   *
   * //remove all local tags
   * git.removeLocalTags({
   *   tags: git.getTags //It's a resolvable. You can specify also ['v1.0.0', 'v1.0.1']
   * });
   *
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|Array<String>} options.tags The tags to remove
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function removeLocalTags(options) {
    assert.ok(options.tags, 'tags is mandatory');

    return options.tags
        .reduce(function(soFar, tag) {
          var args = [
            'tag',
            '-d',
            tag
          ];
          return soFar
              .then(gitFn(args))
              .catch(passWarning)
              .then(silent);
        }, Promise.resolve());
  }

  /**
   * Removes a tag from the remote repo
   * Executes `git push origin :refs/tags/v1.0.0`
   *
   * @example
   * var git = require('gitftw');
   *
   * //remove local tags in 'origin'
   * git.removeRemoteTags({
   *   tags: git.getTags //It's a resolvable. You can specify also ['v1.0.0', 'v1.0.1']
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote="origin"] The remote ref where the tag will be removed
   * @param {Resolvable|Array<String>} options.tags The tags to remove
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function removeRemoteTags(options) {
    assert.ok(options.tags, 'tag is mandatory');

    return options.tags
        .reduce(function(soFar, tag) {
          var args = [
            'push',
            options.remote || 'origin',
            ':refs/tags/' + tag
          ];

          return soFar
              .then(gitFn(args))
              .then(silent);
        }, Promise.resolve());
  }

  /**
   * Removes a set of tags from the remote and local repo
   *
   * @example
   * var git = require('gitftw');
   *
   * //remove all local tags in local and remote 'origin'
   * git.removeTags({
   *   tags: git.getTags //It's a resolvable. You can specify also ['v1.0.0', 'v1.0.1']
   * });
   *
   * @memberof git
   * @type {command}
   *
   * @param {Object} options The options object. All its properties are {@link Resolvable}
   * @param {Resolvable|String} [options.remote="origin"] The remote ref where the tag will be removed
   * @param {Resolvable|Array<String>} options.tags The tags to remove
   * @param {callback} [cb] The execution callback result
   * @returns {Promise} Promise Resolves with undefined
   */
  function removeTags(options) {
    return Promise.resolve()
        .then(git.removeLocalTags.bind(null, options))
        .then(git.removeRemoteTags.bind(null, options));
  }

  //////////////// Utilities

  /**
   * An identity fn over git to make more functional style code
   * inside promises
   *
   * @param {Array}  args
   * @returns {Function}
   */
  function gitFn(args) {
    return function() {
      return git(args);
    };
  }
};

/**
 * Analizes the error given and rejects when it's not a warning
 *
 * @private
 * @param {Error} err The recoverable error
 * @returns {String|Promise} the error message String when its a recoverable error
 *  a rejected promise otherwise
 */
function passWarning(err) {
  if (err.code === 1) {
    //This is a recoverable error. We dont wanna fail
    return err.output;
  }

  return Promise.reject(err);
}

/**
 * Parses the git version
 * @private
 * @param {Resolvable|String} str The 'git version' command output
 * @throws {Error} parsing error
 * @returns {String} the version number
 */
function parseVersion(str) {
  var match = /git version ([0-9\.]+)/.exec(str);

  if (match) {
    return match[1];
  } else {
    throw new Error('Unable to parse version response', str);
  }
}

/**
 * Parses the git tag command
 * @private
 * @param {Resolvable|String} str The 'git tag' command output
 * @returns {Array<String>} the git tags
 */
function parseTags(str) {
  if (!str) {
    return [];
  }

  return str.split(/\n/);
}

/**
 * A function used to remove the commands output
 * @private
 */
function silent() {
  return '';
}
