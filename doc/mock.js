var Q = require('q');


module.exports = function(instance) {
  var mock = instance._mock = {};
  mock.tags = [];

  instance.git = function mockedGit(args, cb) {
    var defer = Q.defer(), out;

    switch(args[0]) {
      case 'tag':
        if (typeof args[1] === 'string') {
          //adding a tag
          mock.tags.push(args[1]);
        }
        else {
          //getting tags
          out = mock.tags.join('\n');
        }
        break;
    }
    instance.events.emit('command', ['mockgit'].concat(args).join(' '));
    out && instance.events.emit('result', out);

    defer.resolve(out);

    return defer.promise.nodeify(cb);
  };

  return instance;
};