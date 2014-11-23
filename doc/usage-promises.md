```js
var GitWorkflow = require('../index.js'),
    Q = require('q');


var git = new GitWorkflow();
//Mocking only for the example purpose
git = require('./mock')(git);

//print the executed git commands
git.events.on('command', console.log);

var remote = 'origin';

/**
 * Creates 2 tags and pushes to remote
 * @returns {Promise} the execution promise
 */
function createTags() {
  //using explicit resolved promise
  return Q()
      .then(git.tag.bind(null, {name: 'foo', message: 'Foo release', annotated: true}))
      .then(git.tag.bind(null, {name: 'bar', message: 'Bar release'}))
      .then(git.push.bind(null, {remote: remote, tags: true}));

}

/**
 * Deletes all local tags from both remote and local
 * @returns {Promise} the execution promise
 */
function deleteTags() {
  return git.fetch({tags: true, remote: remote})
      .then(git.getTags)
      .then(function(tags) {
        return tags
            .map(function(tag) {
              return git.removeTag.bind(null, {tag: tag, remote: remote});
            })
            .reduce(Q.when, Q());
      });
}

/**
 * Creates and deletes tags
 * @returns {Promise} the execution promise
 */
function doWork() {
  return createTags()
      .then(deleteTags);
}

/**
 * Main execution wrapper
 */
doWork().then(
    function() {
      console.log('Done!');
    },
    function(err) {
      console.error('Something went wrong', err);
    }
);
```