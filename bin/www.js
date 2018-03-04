#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var fs = require('fs');
//var debug = require('debug')('standup:server');
var http = require('http');
var https = require('https');
var path = require('path');
var secret = require('../config/secret');

/**
 * Https options
 */
/*const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname,'..', 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname,'..','ssl','server.key'))
}
/**
 * Create Https server.
 */
var server = http.createServer(app);
//var server = https.createServer(httpsOptions,app);
server.listen(3000, function(err) {
    if (err) throw err;
    console.log("Server is Running on port " + secret.port);
});