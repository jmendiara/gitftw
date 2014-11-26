var Q = require('q'),
    mockSpawn = require('mock-spawn'),
    proxyquire = require('proxyquire');


//Mock calls to spawn in test
var mySpawn = mockSpawn();
proxyquire('../src/gitftw', {
  child_process: {
    spawn: mySpawn
  },
  which: {
    sync: function() {
      return 'mockgit'
    }
  }
});

mySpawn.setStrategy(function (command, args, opts) {
  var tags = ['foo', 'bar'];
  var out = '';

  switch(args[0]) {
    case 'tag':
      if (typeof args[1] === 'string') {
        //adding a tag
        tags.push(args[1]);
      }
      else {
        //getting tags
        out = tags.join('\n');
      }
      break;
  }

  return function (cb) {
    this.stdout.write(out);
    return cb(0); // and exit 0
  };
});
