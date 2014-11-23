'use strict';

var git = require('./index');

git.events.on('command', console.info);
git.events.on('result', function(res) {
  console.log('> ' + res.split('\n').join('\n> '))
});


git.clone({
  repository: 'git@github.com:jmendiara/node-lru-cache.git',
  directory: './cache',
  tag: 'v3.0.3'
}).done()

function doWorkPromises() {
  function removeAllTags() {
    return git.removeTags({
      tags: git.getTags, //use resolvables
      remote: 'origin'
    });
  }

  function createTag(name) {
    return git.tag({
      tag: name,
      message: name
    });
  }

  function createTags() {
    return createTag('foo')
        .then(createTag.bind(null, 'bar'))
  }

  createTags()
      .then(removeAllTags2, removeAllTags2)
      .catch(console.error)
      .finally(function() {
        console.log('Done')
      });
}
//doWorkPromises();

function doWorkAsync() {
  var async = require('async');

  function removeAllTags(cb) {
    async.waterfall([
      git.getTags,
      function (tags, cb) {
        git.removeTags({
          tags: tags,
          remote: 'origin'
        }, cb)
      }
    ], cb);
  }

  function createTag(name, cb) {
    git.tag({
      tag: name,
      message: name
    }, cb) ;
  }
  function createTags(cb) {
    async.series([
      async.apply(createTag, 'foo'),
      async.apply(createTag, 'bar')
    ], cb);
  }

  createTags(function() {
    removeAllTags(function (err) {
      console.log('Done', err);
    })
  });
}
//doWorkAsync();

