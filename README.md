# gitftw - Git For The Workflows

[![Build Status](https://travis-ci.org/jmendiara/gitftw.svg)](https://travis-ci.org/jmendiara/gitftw)
[![Coverage Status](https://img.shields.io/coveralls/jmendiara/gitftw.svg)](https://coveralls.io/r/jmendiara/gitftw)

Basic git commands wrapped in node for using in your workflows. This includes grunt, gulp,
your custom scripts, CI, etc...

http://jmendiara.github.io/gitftw/

## Basic Usage
```js
var git = require('gitftw');

//Executes locally installed git with the parameters specified as an array
// > /usr/local/bin/tag 
git(['tag'], function(err, output) {
  if (err) {
    console.error('Command failed with code %d: %s', err.code, err.message);
    return;
  }
  console.log(output); // "'v1.0.0\nv1.0.1\nv1.0.2'" 
});
```

## Commands

There are some basic commands implemented for you, in a workflow developer friendly way.

```js
var git = require('gitftw');

git.pull({
    remote: 'origin',
    branch: 'master',
    rebase: true
  }, cb);
  
git.add({
    files: ['README.md', 'package.json']
  }, cb);

//removing all local tags
git.getTags(function (err, tags) {
  if (err) {
    return cb(err);
  }
  console.log(tags);  //['v1.0.0', 'v1.0.1', 'v1.0.2']
  git.removeLocalTags({
      tags: tags
  }, cb);
})
```

All the commands can take 2 parameters, an _optional_ `options` literal object, 
and the _optional_ callback. A literal object helps you having configurations 
in a json, a grunt config,  etc... even in a function! (read below)

More information on implemented commands, please refer to the [documentation](http://jmendiara.github.io/gitftw/git.html)

## Knowing what's happening under the hoods

Yes, it's important to see _wat_ is doing an automated workflow. We have some
events for you.

```js
var git = require('gitftw');

//Add a listener to the issued git command. Output it
git.events.on('command', console.info);

//Add a listener to the result of the git command. Output it with > 
git.events.on('result', function(res) {
  console.log('> ' + res.split('\n').join('\n> '))
});
```
 

## Sugar: Promises
`git` and its commands have a *dual* API, both the node callback style you have seen
in the examples, and the `promise` style. [Q](https://github.com/kriskowal/q) is used internally as the promises library  

```js
//removing all local tags
git.getTags()
  .tap(console.log) //['v1.0.0', 'v1.0.1', 'v1.0.2']
  .then(function (tags) {
    return git.removeLocalTags({
      tags: tags
    })
  });
```
 
Having promises internally and _optionally_ outside simplifies the development of 
commands to manage concurrency when issuing `git` commands with a more functional style.

Why concurrency matters? Not having concurrency accessing 
the filesystem, where some commands can change its status, is very important for
a predictable command sequence. Think on how you use git from the command line.
We wanna make this tool for workflows as much predictable as possible. And the 
`resolvable` concept helps on both serialization and functional style development

_DISCLAIMER for node fan-boys_: frontenders are also developers. And are bored of your `if(err) return cb(err);` 
 verbose style. And I've always wanted to code something dual :) 


## Advanced usage: _Resolvables_
You can use `resolvables` things when calling this library methods.
Resolvable is something that have invariant primitives, including all its properties, 
now or in the future.

Which things are _resolvables_?

1. A String, Number, Boolean primitives: `string`, 4, true

2. A array of resolvables: `['string', resolvable]`

3. A literal object with resolvables properties: `{ foo: 'string', bar: resolvable }`

5. An object with a `toString` method

6. An A+ promise (Q, bluebird, native...) that resolves to a resolvable: `Promise.when('string')`

7. A function that returns resolvables `function() { return 'string'; }`

__resolvables__ are resolved in serie. Once something is resolved, goes to resolve
the next one. Never in parallel. This avoids race conditions
in your workflows while maintaining your code clean. 

It's easier than you think. The above _remove all tags_ example with __resolvables__: 

```js
//removing all local tags
git.removeLocalTags({
  tags: git.getTags //Command that returns a promise for an array of strings
});
```

`git.getTags`, as it's used as a function parameter, will be called, resolved and assigned
 before `git.removeLocalTags` gets called. 

Take a look to the tests.

## License
MIT
