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
  git.tag({name: 'foo', message: 'Foo release', annotated: true}, function(err) {
    if (err) {
      return cb(err);
    }
    git.tag({name: 'bar', message: 'Bar release'}, function(err) {
      if (err) {
        return cb(err);
      }
      //propagate error
      git.push({remote: remote, tags: true}, cb);
    });
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
      //delete tag in series
      function deleteTag(index) {
        if (!tags[index]) {
          return cb(null);
        }
        git.removeTag({ tag: tags[index], remote: remote }, function (err) {
          if (err) {
            return cb(err);
          }
          deleteTag(++index);
        });
      }
      deleteTag(0);
    });
  });
}

/**
 * Creates and deletes tags
 * @param {Function} cb The result callback
 */
function doWork(cb) {
  createTags(function(err) {
    if (err) {
      return cb(err);
    }
    deleteTags(cb);
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
```


