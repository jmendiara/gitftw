```js
var GitWorkflow = require('../index.js'),
    async = require('async');


var git = new GitWorkflow();
//Mocking only for the example purpose
git = require('./mock')(git);

//print the executed git commands
git.events.on('command', console.log);

var remote = 'origin';

/**
 * Creates 2 tags and pushes to remote
 * @param {Function} cb The result callback
 */
function createTags(cb) {
  async.series([
      async.apply(git.tag, {name: 'foo', message: 'Foo release', annotated: true}),
      async.apply(git.tag, {name: 'bar', message: 'Bar release'}),
      async.apply(git.push, {remote: remote, tags: true})
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
          async.eachSeries(tags, function (tag, cb) {
            git.removeTag({tag: tag, remote: remote}, cb);
          }, cb);
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
    async.apply(createTags),
    async.apply(deleteTags)
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
```
