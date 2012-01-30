/*!
 * GitCDN
 * Copyright(c) 2012 Daniel D. Shaw <dshaw@dshaw.com> (http://dshaw.com)
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var path = require('path')
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

  this.dir = options.dir || __dirname + '/repos'
  this.pushPort = options.pushPort || 7000
  this.hostPort = options.pushPortr || 9000

  if (this.pushPort === this.hostPort) {
    throw new Error('Git push and server are set to the same port.')
  }

  this.repos;
  this.server;

  this.initGit()
  this.initServer()
}

/**
 * Initialize Git Push Server
 */

GitCDN.prototype.initGit = function () {
  var self = this
    , repos = this.repos

  repos = pushover(this.dir)

  repos.on('push', function (repo) {
    console.log('received a push to ' + repo);
  })

  repos.listen(this.pushPort)

  repos.on('listening', function () {
    console.log('listening on :%d', self.pushPort);
  })
}

/**
 * Initialize File Server
 */

GitCDN.prototype.initServer = function () {
  var server = this.server

  server = connect.createServer(connect.static(path.join(this.dir)))

  server.listen(this.hostPort)

  server.on('listening', function () {
    console.log('listening on :', server.address());
  })
}
