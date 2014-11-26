//Mocking only for the example purpose
require('./mock');

var git = require('../index.js');

//print the executed git commands
git.events.on('command', console.log);

var remote = 'origin';

/**
 * Creates the new version tag and pushes to remote
 * @returns {Promise} the execution promise
 */
function createTag() {
  var newTagName = 'v1.0.0';

  return git.tag({tag: newTagName, message: newTagName + ' release', annotated: true})
      .then(git.push.bind(null, {tag: newTagName, remote: remote}));

}

/**
 * Deletes all local tags from both remote and local
 * @returns {Promise} the execution promise
 */
function deleteTags() {
  return git.fetch({tags: true, remote: remote})
      .then(function() {
        return git.removeTags({
          remote: remote,
          tags: git.getTags //using resolvables
        });  
      });
}

/**
 * Creates and deletes tags
 * @returns {Promise} the execution promise
 */
function doWork() {
  return deleteTags()
      .then(createTag);
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
