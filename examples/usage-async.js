//Mocking only for the example purpose
require('./mock');

var git = require('../index.js'),
    async = require('async');


//print the executed git commands
git.events.on('command', console.log);

var remote = 'origin';

/**
 * Creates the new version tag and pushes to remote
 * @param {Function} cb The result callback
 */
function createTag(cb) {
  var newTagName = 'v1.0.0';

  async.series([
      async.apply(git.tag, {tag: newTagName, message: newTagName + ' release', annotated: true}),
      async.apply(git.push, {tag: newTagName, remote: remote})
  ], cb);
}

/**
 * Deletes all local tags from both remote and local
 * @param {Function} cb The result callback
 */
function deleteTags(cb) {
  async.series([
    async.apply(git.fetch, {tags: true, remote: remote}),
    function(cb) {
      async.waterfall([
        async.apply(git.getTags),
        function(tags, cb) {
          git.removeTags({tags: tags, remote: remote}, cb);
        }
      ], cb);
    }
  ], cb);
}

/**
 * Creates and deletes tags
 */
function doWork(cb) {
  async.series([
    async.apply(deleteTags),
    async.apply(createTag)
  ], cb);
}

/**
 * Main execution wrapper
 */
doWork(function(err) {
  if (err) {
    console.error('Something went wrong', err);
    return;
  }
  console.log('Done!');
});