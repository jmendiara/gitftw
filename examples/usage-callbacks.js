//Mocking only for the example purpose
require('./mock');

var git = require('../index.js');


//print the executed git commands
git.events.on('command', console.log);

var remote = 'origin';

/**
 * Creates the new version tag and pushes to remote
 * @param {Function} cb The result callback
 */
function createTag(cb) {
  var newTagName = 'v1.0.0';

  git.tag({tag: newTagName, message: newTagName + ' release', annotated: true}, function(err) {
    if (err) {
      return cb(err);
    }
    
    git.push({tag: newTagName, remote: remote}, cb);
  });
}

/**
 * Deletes all local tags from both remote and local
 * @param {Function} cb The result callback
 */
function deleteTags(cb) {
  git.fetch({ tags: true, remote: remote }, function (err) {
    if (err) {
      return cb(err);
    }
    git.getTags(function(err, tags) {
      if (err) {
        return cb(err);
      }
      
      git.removeTags({
        tags: tags,
        remote: remote
      }, cb);
      
    });
  });
}

/**
 * Creates and deletes tags
 * @param {Function} cb The result callback
 */
function doWork(cb) {
  deleteTags(function(err) {
    if (err) {
      return cb(err);
    }
    createTag(cb);
  });
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
