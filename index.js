/*!
 * GitCDN
 * Copyright(c) 2012 Daniel D. Shaw <dshaw@dshaw.com> (http://dshaw.com)
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var path = require('path')
  , exec = require('child_process').exec
  , connect = require('connect')
  , pushover = require('pushover')

/**
 * Exports
 */

module.exports = GitCDN

/**
 * GitCDN
 */

function GitCDN (options) {
  if (!(this instanceof GitCDN)) return new GitCDN(options)
  options || (options = {})
  this.options = options

  this.repoDir = options.repoDir || __dirname + '/repos'
  this.fileDir = options.fileDir || __dirname + '/files'
  this.pushPort = options.pushPort || 7000
  this.hostPort = options.hostPort || 9000

  if (this.pushPort === this.hostPort) {
    throw new Error('Git push and server are set to the same port.')
  }

  this.pusher;
  this.server;

  this.initGit()
  this.initServer()
}

/**
 * Initialize Git Push Server
 */

GitCDN.prototype.initGit = function () {
  var self = this

  this.pusher = pushover(this.repoDir)

  this.pusher.on('push', function (repo) {
    console.log('received a push to ' + repo);
    exec('git clone ' + path.join(self.repoDir, repo + '.git'), { cwd: self.fileDir  }, function () {
      console.log(arguments);
//                if (name === 'end') {
//                    spawner('git',
//                        [ 'checkout', commit ],
//                        function (name) {
//                            if (name === 'end') {
//                                spawner(command[0], command.slice(1), emit);
//                            }
//                        },
//                        { cwd : dir }
//                    );
//                }
    })
  })

  this.pusher.listen(this.pushPort)

  this.pusher.on('listening', function () {
    console.log('listening on :%d', self.pushPort);
  })
}

/**
 * Initialize File Server
 */

GitCDN.prototype.initServer = function () {
  var self = this

  this.server = connect.createServer(connect.static(path.join(this.repoDir)))

  this.server.listen(this.hostPort)

  this.server.on('listening', function () {
    console.log('listening on :', self.server.address());
  })
}
