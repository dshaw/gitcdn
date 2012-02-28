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
  , util = require('util')
  , connect = require('connect')
  , mkdirp = require('mkdirp')
  , procstream = require('procstreams')
  , pushover = require('pushover')
  , EventEmitter = require('events').EventEmitter

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
  this.basedir = options.basedir || process.cwd()
  this.repodir = options.repodir || this.basedir + '/repos'
  this.filedir = options.filedir || this.basedir + '/files'
  this.pushport = options.pushport || 8000
  this.hostport = options.hostport || 9000

  if (this.pushport === this.hostport) {
    throw new Error('Git push and server are set to the same port.')
  }

  this.pusher = null;
  this.server = null;

  this.initGit()
  this.initServer()
}

util.inherits(GitCDN, EventEmitter)


/**
 * Initialize Git Push Server
 */

GitCDN.prototype.initGit = function () {
  var self = this

  mkdirp(this.filedir)
  this.pusher = pushover(this.repodir)

  this.pusher.on('push', function (repo) {
    self.emit('push', repo)
    console.log('received a push to ' + repo)
    path.exists(path.join(self.filedir, repo), function (exists) {
      if (!exists) {
        procstream('git clone http://localhost:' + self.pushPort + '/' + repo, { cwd: self.filedir  })
      } else {
        procstream('git pull', { cwd: self.filedir  })
      }
    })
  })

  this.pusher.on('listening', function () {
    console.log('listening on :', self.pushport);
  })

  this.pusher.listen(this.pushport)
}

/**
 * Initialize File Server
 */

GitCDN.prototype.initServer = function () {
  var self = this

  this.server = connect.createServer(connect.static(this.filedir))
  this.server.listen(this.hostport)

  this.server.on('listening', function () {
    console.log('listening on :', self.server.address())
    console.log('hosting files in:', self.filedir)
  })
}
